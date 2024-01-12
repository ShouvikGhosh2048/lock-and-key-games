"use client";

interface KeyProps {
    position: [number, number],
    color: string,
}

export function KeySVG({ position, color }: KeyProps) {
    return (
        <>
            <circle cx={position[0]} cy={position[1] - 5} r="5" fill={color} />
            <rect x={position[0] - 2.5} y={position[1] - 2.5} width={5} height={10} fill={color} />
            <circle cx={position[0]} cy={position[1] + 7.5} r="2.5" fill={color} />
        </>
    );
}

interface LockProps {
    position: [number, number],
    color: string,
    open: boolean,
}

export function LockSVG({ position, color, open }: LockProps) {
    return (
        <>
            <rect x={position[0] - 7.5} y={position[1]} width={15} height={15} fill={color} />
            <rect x={position[0] - 5 + (open ? 15 : 0)} y={position[1] - 7} width={2.5} height={7} fill={color} />
            <rect x={position[0] + 2.5} y={position[1] - 7} width={2.5} height={7} fill={color} />
            <rect x={position[0] - 5 + (open ? 7.5 : 0)} y={position[1] - 7} width={10} height={2.5} fill={color} />
        </>
    );
}

interface EdgeProps {
    onMouseDown?: (e: React.MouseEvent) => void,
    color: string,
    endpoints: [[number, number], [number, number]], // vertex coordinates
    locks: {
        color: string,
        open: boolean,
    }[],
    keys: {
        color: string,
    }[],
    type: 'line' | 'curve',
}

export function Edge({ onMouseDown, endpoints, locks, keys, color, type }: EdgeProps) {
    let edgeDirection = [
        endpoints[1][0] - endpoints[0][0],
        endpoints[1][1] - endpoints[0][1],
    ];
    const edgeLength = Math.sqrt(Math.pow(edgeDirection[0], 2) + Math.pow(edgeDirection[1], 2));
    if (edgeLength <= 0.01) {
        edgeDirection = [1, 0];
    } else {
        edgeDirection[0] /= edgeLength;
        edgeDirection[1] /= edgeLength;
    }

    let path;
    if (type === "curve") {
        const controlPoint1 = [
            endpoints[0][0] + 50 * edgeDirection[1] + (edgeLength / 2 - 50) * edgeDirection[0],
            endpoints[0][1] - 50 * edgeDirection[0] + (edgeLength / 2 - 50) * edgeDirection[1],
        ];
        const controlPoint2 = [
            endpoints[1][0] + 50 * edgeDirection[1] - (edgeLength / 2 - 50) * edgeDirection[0],
            endpoints[1][1] - 50 * edgeDirection[0] - (edgeLength / 2 - 50) * edgeDirection[1],
        ];

        path = `
        M ${endpoints[0][0]},${endpoints[0][1]}
        C ${controlPoint1[0]},${controlPoint1[1]} ${controlPoint2[0]},${controlPoint2[1]} ${endpoints[1][0]},${endpoints[1][1]}
      `;
    } else {
        path = `
        M ${endpoints[0][0]},${endpoints[0][1]}
        L ${endpoints[1][0]},${endpoints[1][1]}
      `;
    }

    let curveMidpoint: [number, number];
    if (type === "curve") {
        curveMidpoint = [
            (endpoints[1][0] + endpoints[0][0]) / 2 + 37.5 * edgeDirection[1],
            (endpoints[1][1] + endpoints[0][1]) / 2 - 37.5 * edgeDirection[0]
        ];
    } else {
        curveMidpoint = [
            (endpoints[1][0] + endpoints[0][0]) / 2,
            (endpoints[1][1] + endpoints[0][1]) / 2
        ];
    }

    const lockOffset = [20 * edgeDirection[1], -20 * edgeDirection[0]];

    return (
        <g>
            <path stroke="transparent" fill="none" strokeWidth="20" d={path} onMouseDown={onMouseDown} />
            <path stroke={color} fill="none" strokeWidth="3" d={path} onMouseDown={onMouseDown} />
            <line x1={curveMidpoint[0]} y1={curveMidpoint[1]}
                x2={curveMidpoint[0] - 5 * edgeDirection[0] + 5 * edgeDirection[1]}
                y2={curveMidpoint[1] - 5 * edgeDirection[1] - 5 * edgeDirection[0]}
                stroke={color} strokeWidth="3" />
            <line x1={curveMidpoint[0]} y1={curveMidpoint[1]}
                x2={curveMidpoint[0] - 5 * edgeDirection[0] - 5 * edgeDirection[1]}
                y2={curveMidpoint[1] - 5 * edgeDirection[1] + 5 * edgeDirection[0]}
                stroke={color} strokeWidth="3" />
            {
                locks.map((lock, i) => {
                    const position = [
                        curveMidpoint[0] + lockOffset[0] + (i - (locks.length - 1) / 2) * 25 * edgeDirection[0],
                        curveMidpoint[1] + lockOffset[1] + (i - (locks.length - 1) / 2) * 25 * edgeDirection[1],
                    ] as [number, number];
                    return <LockSVG key={i} position={position} color={lock.color} open={lock.open} />;
                })
            }
            {
                keys.map((key, i) => {
                    const position = [
                        curveMidpoint[0] - lockOffset[0] + (i - (keys.length - 1) / 2) * 30 * edgeDirection[0],
                        curveMidpoint[1] - lockOffset[1] + (i - (keys.length - 1) / 2) * 30 * edgeDirection[1],
                    ] as [number, number];
                    return <KeySVG key={i} position={position} color={key.color} />;
                })
            }
        </g>
    );
}

export interface Graph {
    vertices: {
        position: [number, number], // xy coordinates
        type: 'Player 1' | 'Player 2',
        target: boolean,
    }[],
    edges: {
        endpoints: [number, number], // vertex indices
        locks: number[], // lock index
        keys: number[], // key index
    }[],
    start: number | null, // vertex index
    locks: {
        color: string,
        open: boolean,
    }[],
}