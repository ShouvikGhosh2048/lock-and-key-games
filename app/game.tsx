"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Edge, Graph } from "./graphElements";

interface GameProps {
    graph: Graph,
    isOpen: boolean[],
    setIsOpen: Dispatch<SetStateAction<boolean[]>>,
    position: number,
    setPosition: Dispatch<SetStateAction<number>>,
    scale?: number,
    svgDimensions: {
        width: number,
        height: number,
    }
}

export default function Game({ graph, isOpen, setIsOpen, position, setPosition, scale = 1.0, svgDimensions }: GameProps) {
    const svgElement = useRef<SVGSVGElement>(null);
    
    // Window resize
    useEffect(() => {
        svgElement.current!.style.width = `${svgDimensions.width}px`;
        svgElement.current!.style.height = `${svgDimensions.height}px`;
    }, [svgDimensions]);

    // We keep track of edges to later check if the reverse edge exists.
    const edges = new Set<number>();
    graph.edges.forEach(edge => {
        edges.add(edge.endpoints[0] * graph.vertices.length + edge.endpoints[1]);
    });

    return (
        <svg className="w-full h-full" ref={svgElement}
            viewBox={`${-svgDimensions.width * scale / 2} ${-svgDimensions.height * scale / 2} ${svgDimensions.width * scale} ${svgDimensions.height * scale}`}>
            {graph.edges.map(({ endpoints: [v1, v2], locks, keys }, i) => (
                <Edge key={i} color={"black"} endpoints={[graph.vertices[v1].position, graph.vertices[v2].position]}
                    locks={locks.map(lock => ({
                        color: graph.locks[lock].color,
                        open: isOpen[lock],
                    }))}
                    keys={keys.map(key => ({ color: graph.locks[key].color }))}
                    type={(edges.has(graph.vertices.length * v2 + v1) || v1 === v2) ? 'curve' : 'line'}
                    onMouseDown={() => {
                        if (graph.vertices[position].target) {
                            return;
                        }
                        if (v1 === position && locks.every(lock => isOpen[lock])) {
                            const newIsOpen = [...isOpen];
                            keys.forEach(key => {
                                newIsOpen[key] = !newIsOpen[key];
                            });
                            setIsOpen(newIsOpen);
                            setPosition(v2);
                        }
                    }} />
            ))}
            {graph.vertices.map((vertex, i) => {
                const onMouseDown = () => {
                    graph.edges.forEach(edge => {
                        if (graph.vertices[position].target) {
                            return;
                        }
                        if (edge.endpoints[0] === position && edge.endpoints[1] === i && edge.locks.every(lock => isOpen[lock])) {
                            const newIsOpen = [...isOpen];
                            edge.keys.forEach(key => {
                                newIsOpen[key] = !newIsOpen[key];
                            });
                            setIsOpen(newIsOpen);
                            setPosition(i);
                        }
                    });
                };

                let color = "black";
                if (graph.start === i) {
                    color = "#e11d48";
                } else if (vertex.target) {
                    color = "#0284c7";
                }

                if (vertex.type === "Player 1") {
                    return <circle key={i}
                        cx={vertex.position[0]} cy={vertex.position[1]} r="10"
                        fill={color}
                        onMouseDown={onMouseDown} />;
                }
                else {
                    return <rect key={i}
                        x={vertex.position[0] - 10} y={vertex.position[1] - 10} width="20" height="20"
                        fill={color}
                        onMouseDown={onMouseDown} />;
                }
            })}
            {graph.vertices[position].type === "Player 1" && (
                <circle cx={graph.vertices[position].position[0]} cy={graph.vertices[position].position[1]} r="15"
                    className="pointer-events-none" fill="#4c1d95" />
            )}
            {graph.vertices[position].type === "Player 2" && (
                <rect x={graph.vertices[position].position[0] - 15} y={graph.vertices[position].position[1] - 15} width="30" height="30"
                    className="pointer-events-none" fill="#4c1d95" />
            )}
        </svg>
    );
}