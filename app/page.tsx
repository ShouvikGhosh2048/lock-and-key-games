"use client";

import { useState } from "react";
import Game from "./game";
import { Graph } from "./graphElements";
import Link from "next/link";

interface GameWithControlsProps {
    graph: Graph,
    scale: number,
}

function GameWithControls({ graph, scale }: GameWithControlsProps) {
    const [isOpen, setIsOpen] = useState(graph.locks.map(lock => lock.open));
    const [position, setPosition] = useState(graph.start!);

    return (
        <div>
            <div className="flex justify-between">
                <span className="font-bold text-lg">
                    {graph.vertices[position].target
                        ? "Target reached"
                        : `${graph.vertices[position].type}'s turn`}
                </span>
                <button onClick={() => {
                    setIsOpen(graph.locks.map(lock => lock.open));
                    setPosition(graph.start!);
                }} className="bg-gray-300 py-1 px-2 rounded">Reset</button>
            </div>
            <div className="h-80 w-80 mx-auto">
                <Game graph={graph} isOpen={isOpen} setIsOpen={setIsOpen}
                    position={position} setPosition={setPosition} scale={scale} svgDimensions={{ width: 320, height: 320 }}/>
            </div>
            <p className="text-center">Click on a vertex or edge to move</p>
        </div>
    );
}

export default function Home() {
    const graphs: Graph[] = [
        {
            vertices: [
                {
                    position: [-100.0, 0.0],
                    type: "Player 1",
                    target: false,
                },
                {
                    position: [100.0, 100.0],
                    type: "Player 1",
                    target: false,
                },
                {
                    position: [100.0, -100.0],
                    type: "Player 1",
                    target: false,
                },
            ],
            edges: [
                {
                    endpoints: [0, 1],
                    locks: [],
                    keys: [],
                },
                {
                    endpoints: [2, 0],
                    locks: [],
                    keys: [],
                },
                {
                    endpoints: [1, 2],
                    locks: [],
                    keys: [],
                },
                {
                    endpoints: [2, 1],
                    locks: [],
                    keys: [],
                },
            ],
            start: 0,
            locks: [],
        },
        {
            vertices: [
                {
                    position: [-150.0, 0.0],
                    type: "Player 1",
                    target: false,
                },
                {
                    position: [0.0, 0.0],
                    type: "Player 2",
                    target: false,
                },
                {
                    position: [150.0, 0.0],
                    type: "Player 1",
                    target: true,
                },
            ],
            edges: [
                {
                    endpoints: [0, 1],
                    locks: [],
                    keys: [],
                },
                {
                    endpoints: [1, 2],
                    locks: [],
                    keys: [],
                },
            ],
            start: 0,
            locks: [],
        },
        {
            vertices: [
                {
                    position: [-150.0, 0.0],
                    type: "Player 1",
                    target: false,
                },
                {
                    position: [0.0, 0.0],
                    type: "Player 2",
                    target: false,
                },
                {
                    position: [150.0, 0.0],
                    type: "Player 1",
                    target: true,
                },
            ],
            edges: [
                {
                    endpoints: [0, 1],
                    locks: [],
                    keys: [],
                },
                {
                    endpoints: [1, 0],
                    locks: [],
                    keys: [],
                },
                {
                    endpoints: [1, 2],
                    locks: [],
                    keys: [],
                },
            ],
            start: 0,
            locks: [],
        },
        {
            vertices: [
                {
                    position: [-150.0, 0.0],
                    type: "Player 1",
                    target: false,
                },
                {
                    position: [0.0, 0.0],
                    type: "Player 2",
                    target: false,
                },
                {
                    position: [150.0, 0.0],
                    type: "Player 1",
                    target: true,
                },
            ],
            edges: [
                {
                    endpoints: [0, 1],
                    locks: [],
                    keys: [0],
                },
                {
                    endpoints: [1, 0],
                    locks: [0],
                    keys: [],
                },
                {
                    endpoints: [1, 2],
                    locks: [],
                    keys: [],
                },
            ],
            start: 0,
            locks: [
                {
                    color: "#dc2626",
                    open: false,
                }
            ],
        },
        {
            vertices: [
                { position: [-150, -150], type: "Player 1", target: false },
                { position: [-70, -70], type: "Player 2", target: false },
                { position: [-70, 150], type: "Player 2", target: false },
                { position: [150, -70], type: "Player 1", target: false },
                { position: [150, 150], type: "Player 1", target: true }
            ],
            edges: [
                { endpoints: [0, 1], locks: [], keys: [1] },
                { endpoints: [1, 2], locks: [], keys: [2] },
                { endpoints: [3, 4], locks: [0], keys: [] },
                { endpoints: [2, 4], locks: [1], keys: [] },
                { endpoints: [2, 1], locks: [2], keys: [] },
                { endpoints: [3, 1], locks: [], keys: [3] },
                { endpoints: [1, 3], locks: [3], keys: [0] },
                { endpoints: [3, 2], locks: [], keys: [1, 2] }
            ],
            start: 0,
            locks: [
                { color: "#dc2626", open: true },
                { color: "#22c55e", open: false },
                { color: "#3b82f6", open: true },
                { color: "#f97316", open: true }
            ]
        },
    ];

    return (
        <div className="p-5 max-w-3xl mx-auto">
            <p className="text-5xl font-bold text-center">Lock and key games</p>
            <p className="text-center py-10 border-b-2">
                Lock and key games are a class of games introduced in section 3.2 of <a href="https://arxiv.org/abs/2305.04096" className="underline">this paper</a>.
                Given a graph and some initial configuration, deciding whether player 1 wins is EXPTIME-complete.
            </p>
            <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between py-10 border-b-2">
                <p>First consider a directed graph. We choose a start vertex (red). From the start vertex, we can move to different vertices using the edges.</p>
                <GameWithControls graph={graphs[0]} scale={1.2} />
            </div>
            <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between py-10 border-b-2">
                <div className="space-y-3">
                    <p>
                        Now we label the vertices as player 1 (circle) or player 2 (square).
                        We also label certain vertices as the target vertex (blue).
                    </p>
                    <p>
                        The goal of player 1 is to reach a target vertex, while the goal of player 2 is to prevent this.
                    </p>
                    <p>
                        For this graph, player 1 will reach the target.
                    </p>
                </div>
                <GameWithControls graph={graphs[1]} scale={1.2} />
            </div>
            <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between py-10 border-b-2">
                <div className="space-y-3">
                    <p>
                        For this graph, player 2 can prevent player 1 from reaching the target.
                    </p>
                </div>
                <GameWithControls graph={graphs[2]} scale={1.2} />
            </div>
            <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between py-10 border-b-2">
                <div className="space-y-3">
                    <p>
                        Now we introduce locks and keys. Locks and keys are placed on the edges.
                    </p>
                    <p>
                        A player can move along an edge only if all the locks on the edge are open.
                    </p>
                    <p>
                        When a player moves along an edge, for each key on the edge, we flip the state
                        of the corresponding lock.
                    </p>
                    <p>
                        In this case when player 1 first moves, the lock is opened, so player 2 can move player 1 back.
                        When player 1 moves again, the lock gets locked, and so player 2 is forced to move to the target.
                    </p>
                </div>
                <GameWithControls graph={graphs[3]} scale={1.2} />
            </div>
            <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between py-10 border-b-2">
                <div className="space-y-3">
                    <p>
                        You can use multiple locks and edges.
                    </p>
                    <p>
                        In this graph (by Pranav), the first player can force a win, but if they play a wrong move,
                        then player 2 can force a win.
                    </p>
                    <p>
                        (Note: If a player has no possible moves, and hasn&apos;t reached a target, player 2 wins.)
                    </p>
                </div>
                <GameWithControls graph={graphs[4]} scale={1.2} />
            </div>
            <div>
                <p className="pt-10 pb-5 text-center font-bold text-xl">
                    This website allows you create your own lock and key games.
                </p>
                <p className="pt-5 pb-10 text-center">
                    <Link href="/editor" className="inline-block bg-slate-900 text-white py-3 px-10 rounded font-bold text-lg">Go to editor</Link>
                </p>
            </div>
        </div>
    )
}