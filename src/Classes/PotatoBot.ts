import makeWASocket, { AuthenticationState, ConnectionState, DisconnectReason, useMultiFileAuthState } from "baileys";
import P from 'pino'
import QRCode from 'qrcode'
import { Boom } from "@hapi/boom";

interface BotInterface {
    prefixes: string[];
    sock: any;
}

export default class PotatoBot implements BotInterface {
    prefixes: string[];
    sock: any;
    saveCreds: any;

    constructor() {
        this.prefixes = ['!', '-'];
        this.startSock().then(() => { 
            this.sock.ev.on('connection.update', this.connectionUpdate);
            this.sock.ev.on('messages.upsert', this.messagesUpsert);
            this.sock.ev.on("creds.update", this.saveCreds);
        });
    }

    async startSock(): Promise<void> {
        const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

        this.saveCreds = saveCreds;

        this.sock = makeWASocket({
            auth: state,
            logger: P(),
            shouldSyncHistoryMessage: () => false
        });
    }

    async connectionUpdate(update: Partial<ConnectionState>): Promise<void> {
        const {connection, lastDisconnect, qr } = update

        if (
            connection === 'close' 
            && (lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.restartRequired
        ) {
            await this.restartConnection();
            return;
        }

        if (qr) {
            console.log(await QRCode.toString(qr, {type:'terminal', small: true}))
        }
    }

    messagesUpsert = ({type, messages}: any) => {
        if (type == "notify") { // new messages
            for (const messageInfo of messages) {
                const messageText = messageInfo.message?.conversation;

                if (messageText == 'batata corintiana') {
                    this.sock?.sendMessage(messageInfo.key.remoteJid!, {text: "Batata Frita"});
                }
            }
        }
    }

    async restartConnection(): Promise<void> {
        this.startSock().then(() => { 
            this.sock.ev.on('connection.update', this.connectionUpdate);
            this.sock.ev.on('messages.upsert', this.messagesUpsert);
            this.sock.ev.on("creds.update", this.saveCreds);
        });
    }
}