/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';

const Message: React.FC = () => {
    const [peerId, setPeerId] = useState<string>('');
    const [remotePeerId, setRemotePeerId] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const peerRef = useRef<Peer | null>(null);
    const connRef = useRef<DataConnection | null>(null);

    useEffect(() => {
        const peer = new Peer();
        peerRef.current = peer;

        peer.on('open', (id) => {
            setPeerId(id);
        });

        peer.on('connection', (conn) => {
            connRef.current = conn;
            conn.on('data', (data: any) => {
                if (typeof data === 'string') {
                    setMessages((prevMessages) => [...prevMessages, `Remote: ${data}`]);
                } else {
                    const blob = new Blob([data]);
                    const url = URL.createObjectURL(blob);
                    setMessages((prevMessages) => [...prevMessages, `Remote sent a file: ${url}`]);
                }
            });
        });

        return () => {
            peer.destroy();
        };
    }, []);

    const connectToPeer = () => {
        if (peerRef.current) {
            const conn = peerRef.current.connect(remotePeerId);
            connRef.current = conn;
            conn.on('data', (data: any) => {
                if (typeof data === 'string') {
                    setMessages((prevMessages) => [...prevMessages, `Remote: ${data}`]);
                } else {
                    const blob = new Blob([data]);
                    const url = URL.createObjectURL(blob);
                    setMessages((prevMessages) => [...prevMessages, `Remote sent a file: ${url}`]);
                }
            });
        }
    };

    const sendMessage = () => {
        if (connRef.current) {
            connRef.current.send(message);
            setMessages((prevMessages) => [...prevMessages, `You: ${message}`]);
            setMessage('');
        }
    };

    const sendFile = () => {
        if (connRef.current && file) {
            connRef.current.send(file);
            setMessages((prevMessages) => [...prevMessages, `You sent a file: ${file.name}`]);
            setFile(null);
        }
    };

    return (
        <div>
            <h1>PeerJS Chat</h1>
            <p>Your ID: {peerId}</p>
            <input
                type="text"
                placeholder="Remote Peer ID"
                value={remotePeerId}
                onChange={(e) => setRemotePeerId(e.target.value)}
            />
            <button onClick={connectToPeer}>Connect</button>
            <div>
                <input
                    type="text"
                    placeholder="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send Message</button>
            </div>
            <div>
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
                <button onClick={sendFile}>Send File</button>
            </div>
            <div>
                <h2>Messages</h2>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Message;