import client from "../../index.ts";
import { Command } from "../../structures/Command.ts";
import { ApplicationCommandOptionType, ChatInputCommandInteraction, ForumChannel, MessageFlags, PermissionFlagsBits, PermissionsBitField, TextChannel, ThreadChannel } from "discord.js";
import { Edupage } from "edupage-api"
import download from "download";
import { htmlToText } from "html-to-text";
import fs from "fs"



export default class EduCommand extends Command {
    private edupage = new Edupage();
    constructor() {
        super({
            name: "edu",
            description: "Edupage Utils",
            category: "edu",
            allowDm: true,
            serverOnly: [],
            dev: client.mode,
            clientPermissions: [],
            userPermissions: [],
            enabled: true,
            cooldown: 5,
            cooldownFilteredUsers: [],
            nsfw: false,
            options: [
                {
                    name: "remove",
                    description: "Remove homework using superID",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    autocomplete: true,
                },
                {
                    name: "extra",
                    description: "Extra options",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    choices: [
                        {
                            name: "show-teachers",
                            value: "show-teachers"
                        },
                        {
                            name: "fill-db",
                            value: "fill-db"
                        }
                    ]
                }
            ]
        });
    }


    public async slashCommandExecute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await this.edupage.login(
            process.env.EDU_NAME!,
            process.env.EDU_PASS!
        );

        if (interaction.options.getString("extra") === "show-teachers") {
            const data = await this.getTeachers(this.edupage);
            const formattedData = data
                .map(
                    (item: {
                        firstName: string;
                        lastName: string;
                        shortName: string;
                        id: string;
                    }) =>
                        `${item.firstName} ${item.lastName} (${item.shortName}) - ID: ${item.id}`,
                )
                .join("\n");

            const chunks = this.chunkString(formattedData, 2000);

            await interaction.editReply("Here's the data:");

            for (const chunk of chunks) {
                await interaction.followUp(chunk);
            }
            return;
        }

        if (interaction.options.getString("remove")) {
            await this.client.prisma.homeworkExists.deleteMany({
                where: {
                    superID: interaction.options.getString("remove")!,
                    guilID: interaction.guild?.id
                },
            }).catch(e => {
                this.client.logger.error(`Error deleting homework ${interaction.options.getString("remove")} in guild ${interaction.guild?.name}: ${e}`, this.name);
                return interaction.reply({ content: "Error deleting homework", flags: MessageFlags.Ephemeral });
            })

            return await interaction.reply({ content: "Homework Removed" });
        }

        const startTime = Date.now();
        const guildId = interaction.guild?.id


        const hwChannels = await this.client.prisma.homeWorkChannels.findUnique({
            where: { guildId },
        });

        if (!hwChannels) {
            this.client.logger.error(`No channels config found for guild ${guildId}`, this.name);
            return interaction.editReply("No homework channels configured for this server.");
        }

        const channels: Record<string, string> = hwChannels.channels as Record<string, string>;

        const homework = (
            await Promise.all(
                this.edupage.assignments.map(async (work: Assignment) => {
                    this.client.logger.info(
                        `Starting processing: ${work.title} (${work.id})`,
                        this.name
                    );
                    if (
                        await this.client.prisma.homeworkExists.findFirst({
                            where: {
                                superID: work.superId,
                                guilID: guildId,
                            },
                        })
                    ) {
                        this.client.logger.info(
                            `Already exists skipping: ${work.title} (${work.id})`,
                            this.name
                        );
                        return null;
                    }

                    return {
                        id: work.id,
                        superId: work.superId,
                        owner: {
                            id: work.owner.id,
                            name: `${work.owner.firstname} ${work.owner.lastname}`,
                            userString: work.owner.userString,
                        },
                        subject: {
                            id: work.subject.id,
                            name: work.subject.name,
                            shortName: work.subject.short,
                        },
                        title: work.title,
                        testId: work.testId,
                        type: work.type,
                    };
                }),
            )
        ).filter((hw) => hw != null);
        if (homework.length == 0) {
            return interaction.editReply({ content: "No homework found" });
        }


        for (const work of homework) {
            const forumId = channels[work.subject.shortName];
            if (!forumId) {
                this.client.logger.error(
                    `No forum found for subject: ${work.subject.shortName}`,
                    this.name
                );
                continue;
            }

            const guild = interaction.guild

            if (!guild) {
                this.client.logger.error(`No guild found`, this.name);
                continue;
            }

            const forum: ForumChannel = (await guild.channels.cache.get(
                forumId,
            )) as ForumChannel;
            if (!forum) {
                this.client.logger.error(`No forum found`, this.name);
                continue;
            }

            if (interaction.options.getString("extra") === "fillDB") {
                this.client.logger.info(`Filling DB for ${interaction.guild.id}`, this.name)
                await this.client.prisma.homeworkExists.create({
                    data: {
                        superID: work.superId,
                        title: work.title,
                        forumChannelID: "fill",
                        forumID: forum.id,
                        guilID: guild.id
                    }
                })


                continue
            }


            if (work.testId == undefined) {
                const title =
                    work.title.length > 100
                        ? work.title.substring(0, 99)
                        : work.title;
                let msg = `
				\`\`\`
{
    "SuperID": "${work.superId}",
    "Autor": "${work.owner.name}",
    "Subject": "${work.subject.name}",
	"Title": "${work.title}",
	"Type": "${work.type}"
}
\`\`\`
				`;
                const noIdForum = await forum.threads.create({
                    name: title,
                    message: { content: msg },
                });
                await this.client.prisma.homeworkExists.create({
                    data: {
                        superID: work.superId,
                        title: work.title,
                        forumChannelID: noIdForum.id,
                        forumID: forum.id,
                        guilID: guild.id
                    }
                })
                continue;
            }

            const materialData: TestData = await this.getMaterial(
                this.edupage,
                work,
            );

            if (!materialData) {
                this.client.logger.warn(`No materialData... continuing`, this.name);
                continue;
            }

            const title =
                work.title.length > 100
                    ? work.title.substring(0, 99)
                    : work.title;
            let msg = `
\`\`\`json
{
    "Id": "${materialData.testid}",
    "SuperId": "${work.superId}",
    "Autor": "${work.owner.name}",
    "Title": "${work.title}",
    "CardIds": [${materialData.cardids.map((id) => `"${id}"`).join(", ")}],
    "Type": "${work.type}",
    "Time": "${materialData.timestamp.split(" ")[0]}"
}\`\`\``;

            this.client.logger.info(
                `Creating forum Thread for ${work.title}`,
                this.name
            );
            const forumChan: ThreadChannel | null = await forum.threads
                .create({
                    name: title,
                    message: { content: msg },
                })
                .catch((err) => {
                    this.client.logger.error(`Error creating forum: ${err}`, this.name);
                    return null;
                })

            if (!forumChan) {
                this.client.logger.error(`No forumChan... continuing`, this.name);
                continue;
            }

            const messageChannel = guild.channels.cache.get(
                forumChan.id,
            ) as TextChannel;
            const text: string[] = [];
            const files: { src: string; name: string }[] = [];
            const videos: string[] = [];
            const images: { src: string; name: string }[] = [];

            for (const id of materialData.cardids) {
                const data = await materialData.cardsData[id];
                if (!data) {
                    this.client.logger.info(`No data for id: ${id}`, this.name);
                    continue;
                }

                const homeworkData: QuestionETestWidget = await JSON.parse(
                    data.content,
                );
                for (const widget of homeworkData.widgets) {
                    //fs.appendFileSync("./widget.json", JSON.stringify(widget));
                    if (widget.widgetClass == "VideoETestWidget") {
                        videos.push(
                            this.stripHtmlTags(widget.props.source.src),
                        );
                        if (widget?.props?.files) {
                            widget.props.files.map((obj: { src: string; name: string }) => {
                                files.push({
                                    src: obj.src,
                                    name: obj.name,
                                });
                            });
                        }
                    }

                    if (widget.widgetClass == "ElaborationETestWidget") {
                        if (widget?.props?.files) {
                            widget.props.files.map((obj: { src: string; name: string }) => {
                                files.push({
                                    src: obj.src,
                                    name: obj.name,
                                });
                            });
                        }
                    }

                    if (widget.widgetClass == "FileETestWidget") {
                        files.push(
                            ...widget.props.files.map((file: { src: string; name: string }) => {
                                return {
                                    src: file.src,
                                    name: `${Math.random()}file_${file.name}`,
                                };
                            }),
                        );
                    }

                    if (widget.widgetClass == "ImageETestWidget") {
                        images.push(
                            ...widget.props.src.map((img: { src: string; name: string }) => {
                                return {
                                    src: img.src,
                                    name: `${Math.random()}img_${img.name}`,
                                };
                            }),
                        );
                    }

                    if (widget.widgetClass == "OrderingAnswerETestWidget") {
                        // TODO
                    }

                    if (widget.widgetClass == "TitleETestWidget") {
                        // TODO
                    }

                    if (widget.widgetClass == "TextETestWidget") {
                        const htmlText = this.stripHtmlTags(
                            widget.props.htmlText,
                        );
                        const strippedParsedText = this.stripHtmlTags(
                            widget.props._parsedHtmlText,
                        );

                        if (widget?.props?.files) {
                            widget.props.files.map((obj: { src: string; name: string }) => {
                                files.push({
                                    src: obj.src,
                                    name: obj.name,
                                });
                            });
                        }

                        if (htmlText != undefined && htmlText.trim() !== "") {
                            text.push(htmlText);
                        }

                        if (
                            strippedParsedText != undefined &&
                            strippedParsedText.trim() !== ""
                        ) {
                            text.push(strippedParsedText);
                        }
                    }
                }
            }
            for (const str of this.removeDuplicateYouTubeLinks([
                ...text,
                ...videos,
            ])) {
                if (str.length === 0) continue;

                await messageChannel
                    .send({ content: htmlToText(str, { wordwrap: false }) })
                    .catch((err) => {
                        this.client.logger.error(`Error sending message: ${err}`, this.name)
                        return;
                    });
            }

            for (const file of files) {
                const fileUrl = "https://sps-snina.edupage.org" + file.src;
                await download(fileUrl, "./", { filename: file.name });
                await messageChannel
                    .send({ files: [{ attachment: `./${file.name}` }] })
                    .then(() => {
                        fs.unlinkSync(`./${file.name}`);
                    })
                    .catch((err) => {
                        this.client.logger.error(`Error sending Attachment: ${err}`, this.name)
                        return;
                    });
            }

            for (const img of images) {
                const fileUrl = "https://sps-snina.edupage.org" + img.src;
                await download(fileUrl, "./", { filename: img.name });
                await messageChannel
                    .send({ files: [{ attachment: `./${img.name}` }] })
                    .then(() => {
                        fs.unlinkSync(`./${img.name}`);
                    })
                    .catch((err) => {
                        this.client.logger.error(`Error sending Attachment: ${err}`, this.name)
                        return;
                    });
            }
            await this.client.prisma.homeworkExists.create({
                data: {
                    superID: work.superId,
                    title: work.title,
                    forumChannelID: forumChan.id,
                    forumID: forum.id,
                    guilID: guild.id
                }
            })
        }
        const endTime = Date.now();

        interaction.editReply(
            `Processing completed [${endTime - startTime}ms].`,
        );
        this.client.logger.info(
            `Processing assignments took: ${endTime - startTime}ms`,
            this.name
        );
        this.edupage.exit();
    }

    private chunkString(str: string, length: number): string[] {
        const chunks = [];
        let i = 0;
        while (i < str.length) {
            chunks.push(str.slice(i, i + length));
            i += length;
        }
        return chunks;
    }

    private getTeachers(edupage: Edupage) {
        return edupage.teachers.map((teacher) => {
            return {
                firstName: teacher.firstname,
                lastName: teacher.lastname,
                shortName: teacher.short,
                id: teacher.id,
            };
        });
    }

    private async getMaterial(edupage: Edupage, homework: Work) {
        const assignment = edupage.assignments.find((assig: Assignment) =>
            assig.title.startsWith(homework.title),
        );

        if (!assignment) {
            this.client.logger.info(
                `Assignment not found for homework: ${homework.title}`,
                this.name
            );
            return;
        }

        const material = await assignment.getData().catch(async (err: Error) => {
            this.client.logger.error(`Error while getting Material: ${err}`, this.name);
            return;
        });

        if (!material?.materialData) {
            this.client.logger.info(
                `Material data not found for homework: ${homework.title}`,
                this.name
            );
            return null;
        }
        return material.materialData;
    }

    private stripHtmlTags(text: String): string {
        if (!text) return "";
        return text.toString().replace(/<[^>]*>/g, "");
    }

    private removeDuplicateYouTubeLinks(links: string[]): string[] {
        const videoIdsSet = new Set<string>();
        const uniqueLinks: string[] = [];

        // Iterate over the array and extract video IDs
        links.forEach((link) => {
            const videoId = this.extractVideoId(link);
            if (videoId && !videoIdsSet.has(videoId)) {
                videoIdsSet.add(videoId);
                uniqueLinks.push(link);
            } else if (!videoId) {
                // If it's not a YouTube link, keep it as is
                uniqueLinks.push(link);
            }
        });

        return uniqueLinks;
    }

    private extractVideoId(link: string): string | null {
        const regex =
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = link.match(regex);
        return match ? match[1] : null;
    }

}

interface Work {
    id: string;
    superId: string;
    owner: {
        id: string;
        name: string;
        userString: string;
    };
    subject: {
        id: string;
        name: string;
        shortName: string;
    };
    title: string;
    testId: string;
    type: string;
}


interface TestData {
    testid: string;
    userid: string;
    author: string;
    timestamp: string;
    name: string;
    short: string | null;
    description: string | null;
    keywords: string | null;
    options: {
        variants: any[][];
        gvariants: any[][];
        screenProps: { cardsPerScreen: string };
        studyCompetences: any[];
        standards: any[];
        variantsChanged: string;
    };
    cardids: string[];
    etestType: string;
    copyof: string | null;
    school_card: string | null;
    co_som: string;
    editable: boolean;
    cardsData: {
        [key: string]: {
            cardid: string;
            userid: string;
            author: string;
            keywords: string;
            competences: string | null;
            subjectid: string | null;
            content: string;
            timestamp: string;
            stav: string;
            copyof: string | null;
            school_card: string | null;
            visibility: string;
            has_question: string;
            moredata: string | null;
            copyof_diff: string | null;
            histid: string;
            groupid: string | null;
            license: string | null;
            editable: boolean;
        };
    };
}

interface Student {
    edupage: Edupage;
    dateFrom: Date;
    dateTo: Date | null;
    firstname: string;
    lastname: string;
    gender: "M" | "F";
    id: string;
    userString: string;
    isOut: boolean;
    origin: string;
    credentials: any; // Replace 'any' with the appropriate type
    cookies: any; // Replace 'any' with the appropriate type
    isLoggedIn: boolean;
    email: string | null;
    number: number;
    numberInClass: number;
    parent1Id: string;
    parent2Id: string;
    parent3Id: string;
    parent1: Parent | undefined;
    parent2: Parent | undefined;
    parent3: Parent | null;
    class: Class;
}
interface Teacher {
    edupage: Edupage;
    dateFrom: Date;
    dateTo: Date | null;
    firstname: string;
    lastname: string;
    gender: "M" | "F";
    id: string;
    userString: string;
    isOut: boolean;
    origin: string;
    credentials: any; // Replace 'any' with the appropriate type
    cookies: any; // Replace 'any' with the appropriate type
    isLoggedIn: boolean;
    email: string | null;
    cb_hidden: number;
    short: string;
    classroom: Classroom | undefined;
}

interface Parent {
    edupage: Edupage;
    dateFrom: Date | null;
    dateTo: Date | null;
    firstname: string;
    lastname: string;
    gender: "M" | "F";
    id: string;
    userString: string;
    isOut?: boolean;
    origin: string;
    credentials: any; // Replace 'any' with the appropriate type
    cookies: any; // Replace 'any' with the appropriate type
    isLoggedIn: boolean;
    email: string | null;
}

interface Period {
    id: string;
    name: string;
    short: string;
    startTime: string;
    endTime: string;
}

interface Subject {
    id: string;
    name: string;
    short: string;
}
interface Classroom {
    edupage: Edupage;
    cb_hidden: boolean;
    id: string;
    name: string;
    short: string;
}

interface Class {
    edupage: Edupage;
    grade: number;
    id: string;
    name: string;
    short: string;
    classroom: Classroom;
    teacher: Teacher;
    teacher2?: Teacher;
}

interface Application {
    edupage: Edupage;
    id: string;
    dateFrom: Date | null;
    dateTo: Date | null;
    name: string;
    parameters: string[];
    availableFor: string;
    isEnabled: boolean;
    isTextOptional: boolean;
    isAdvancedWorkflow: boolean;
    isSimpleWorkflow: boolean;
}

interface Plan {
    edupage: Edupage;
    id: string;
    subjectId: string;
    customClassId: string;
    customName: string;
    changedDate: Date;
    year: number;
    settings: any; // Replace 'any' with the appropriate type
    isPublic: boolean;
    state: string;
    isValid: boolean;
    approvedDate: Date | null;
    isApproved: boolean;
    otherId: any; // Replace 'any' with the appropriate type
    topicsCount: number;
    taughtCount: number;
    standardsCount: number;
    timetableGroup: string;
    season: any; // Replace 'any' with the appropriate type
    name: string;
    classOrdering: number;
    isEntireClass: boolean;
    subject: Subject;
    classes: Class[][];
    teacher: Teacher;
    teachers: Teacher[][];
    students: (Student | undefined)[][];
}

interface ASC { }

interface Assignment {
    edupage: Edupage;
    id: string;
    superId: string;
    owner: Teacher;
    subject: Subject;
    title: string;
    details: string;
    creationDate: Date;
    fromDate: Date;
    toDate: Date;
    duration: number;
    period: Period | null;
    testId: string;
    type: string;
    hwkid: string | null;
    cardsCount: number;
    answerCardsCount: number;
    state: string;
    isSeen: boolean;
    comment: string;
    result: string;
    isFinished: boolean;
    stateUpdatedDate: Date;
    stateUpdatedBy: Student;
    grades: any[]; // Replace 'any' with the appropriate type
}

interface Homework {
    edupage: Edupage;
    id: string;
    superId: string;
    owner: Teacher;
    subject: Subject;
    title: string;
    details: string;
    creationDate: Date;
    fromDate: Date;
    toDate: Date;
    duration: number;
    period: Period | null;
    testId: string;
    type: string;
    hwkid: string;
    cardsCount: number;
    answerCardsCount: number;
    state: string;
    isSeen: boolean;
    comment: string;
    result: string;
    isFinished: boolean;
    stateUpdatedDate: Date;
    stateUpdatedBy: Student;
    grades: any[]; // Replace 'any' with the appropriate type
}

interface Test {
    edupage: Edupage;
    id: string;
    superId: string;
    owner: Teacher;
    subject: Subject;
    title: string;
    details: string;
    creationDate: Date;
    fromDate: Date;
    toDate: Date;
    duration: number;
    period: Period | null;
    testId: string;
    type: string;
    hwkid: string | null;
    cardsCount: number;
    answerCardsCount: number;
    state: string;
    isSeen: boolean;
    comment: string;
    result: string;
    isFinished: boolean;
    stateUpdatedDate: Date;
    stateUpdatedBy: Teacher;
    grades: any[]; // Replace 'any' with the appropriate type
}

interface Lesson {
    edupage: Edupage;
    id: string;
    lid: string;
    date: string;
    homeworkNote: undefined | string;
    absentNote: undefined | string;
    curriculum: null | any; // Modify type according to actual data
    onlineLessonURL: null | string;
    isOnlineLesson: boolean;
    period: Period;
    subject: Subject;
    classes: Class[];
    classrooms: Classroom[];
    students: Student[];
    teachers: Teacher[];
    assignments: Assignment[];
}

interface ITimetable {
    edupage: Edupage;
    date: string;
    lessons: Lesson[];
    week: number;
}
interface WidgetProps {
    [key: string]: any;
}

interface Widget {
    widgetid: string;
    widgetClass: string;
    props: WidgetProps;
    widgets: (FileETestWidget | TextETestWidget | QuestionETestWidget)[];
    cardid?: string;
}

interface FileETestWidgetProps extends WidgetProps {
    src: string;
    name: string;
    thumb_l?: string;
    thumb_m?: string;
    thumb_s?: string;
    type: string;
    width?: number;
    height?: number;
    ts?: string;
    id: number;
    aspectRatio?: number;
    cssFlex?: string;
}

interface FileETestWidget extends Widget {
    props: FileETestWidgetProps;
}

interface TextETestWidgetProps extends WidgetProps {
    htmlText: string;
    guid: string;
    isSecured?: boolean;
    _parsedHtmlText?: string;
}

interface TextETestWidget extends Widget {
    props: TextETestWidgetProps;
}

interface QuestionETestWidget extends Widget {
    widgets: (FileETestWidget | TextETestWidget)[];
}
