import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "baileys";
import P from 'pino'
import QRCode from 'qrcode'
import { Boom } from "@hapi/boom";

async function startConnection(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

    const sock = makeWASocket({
        auth: state,
        logger: P(),
        shouldSyncHistoryMessage: () => false
    });

    sock.ev.on('connection.update', async (update) => {
        const {connection, lastDisconnect, qr } = update
        // on a qr event, the connection and lastDisconnect fields will be empty

        if (connection === 'close' && (lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.restartRequired) {
            // create a new socket, this socket is now useless
            startConnection();
            return;
        }

        // In prod, send this string to your frontend then generate the QR there
        if (qr) {
            // as an example, this prints the qr code to the terminal
            console.log(await QRCode.toString(qr, {type:'terminal', small: true}))
        }
    });

    sock.ev.on('messages.upsert', ({type, messages}) => {
        if (type == "notify") { // new messages
            for (const messageInfo of messages) {
                const messageText = messageInfo.message?.conversation;

                if (messageText == 'batata corintiana') {
                    sock.sendMessage(messageInfo.key.remoteJid!, {text: "Batata Frita"});
                }
            }
        } else { // old already seen / handled messages
            // handle them however you want to
        }
    })

    sock.ev.on("creds.update", saveCreds);
}

startConnection();