"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { z } from "zod";

const LOCK_COLORS = [
  "#dc2626",
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#facc15",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "black",
];

interface KeyProps {
  position: [number, number],
  color: string,
}

function Key({ position, color }: KeyProps) {
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

function Lock({ position, color, open }: LockProps) {
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

function Edge({ onMouseDown, endpoints, locks, keys, color, type }: EdgeProps) {
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
      endpoints[0][0] + 50 * edgeDirection[1] + (edgeLength/2 - 50) * edgeDirection[0],
      endpoints[0][1] - 50 * edgeDirection[0] + (edgeLength/2 - 50) * edgeDirection[1],
    ];
    const controlPoint2 = [
      endpoints[1][0] + 50 * edgeDirection[1] - (edgeLength/2 - 50) * edgeDirection[0],
      endpoints[1][1] - 50 * edgeDirection[0] - (edgeLength/2 - 50) * edgeDirection[1],
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
      <path stroke="transparent" fill="none" strokeWidth="20" d={path} onMouseDown={onMouseDown}/>
      <path stroke={color} fill="none" strokeWidth="3" d={path} onMouseDown={onMouseDown}/>
      <line x1={curveMidpoint[0]} y1={curveMidpoint[1]}
            x2={curveMidpoint[0] - 5 * edgeDirection[0] + 5 * edgeDirection[1]}
            y2={curveMidpoint[1] - 5 * edgeDirection[1] - 5 * edgeDirection[0]}
            stroke={color} strokeWidth="3"/>
      <line x1={curveMidpoint[0]} y1={curveMidpoint[1]}
            x2={curveMidpoint[0] - 5 * edgeDirection[0] - 5 * edgeDirection[1]}
            y2={curveMidpoint[1] - 5 * edgeDirection[1] + 5 * edgeDirection[0]}
            stroke={color} strokeWidth="3"/>
      {
        locks.map((lock, i) => {
          const position = [
            curveMidpoint[0] + lockOffset[0] + (i - (locks.length - 1) / 2) * 25 * edgeDirection[0],
            curveMidpoint[1] + lockOffset[1] + (i - (locks.length - 1) / 2) * 25 * edgeDirection[1],
          ] as [number, number];
          return <Lock key={i} position={position} color={lock.color} open={lock.open} />;
        })
      }
      {
        keys.map((key, i) => {
          const position = [
            curveMidpoint[0] - lockOffset[0] + (i - (keys.length - 1) / 2) * 30 * edgeDirection[0],
            curveMidpoint[1] - lockOffset[1] + (i - (keys.length - 1) / 2) * 30 * edgeDirection[1],
          ] as [number, number];
          return <Key key={i} position={position} color={key.color} />;
        })
      }
    </g>
  );
}

interface SelectAndAddProps<T> {
  choices: {
    label: string,
    value: T,
  }[],
  onChoose: (value: T) => void,
}

function SelectAndAdd<T>({ choices, onChoose }: SelectAndAddProps<T>) {
  const [showSelection, setShowSelection] = useState(false);
  const [index, setIndex] = useState(0);

  if (choices.length === 0) {
    return <span></span>;
  }

  if (!showSelection) {
    return <button onClick={() => { setShowSelection(true); }}>Add</button>;
  }

  return (
    <span className="flex gap-1">
      <select className="py-0.5 px-1" value={index} onChange={(e) => { setIndex(parseInt(e.target.value)); }}>
        {choices.map((choice, i) => <option key={i} value={i} className="font-sans">{choice.label}</option>)}
      </select>
      <button onClick={() => {
        setShowSelection(false);
        onChoose(choices[index].value);
      }} className="bg-gray-300 py-0.5 px-1 rounded">Add</button>
      <button onClick={() => {
        setShowSelection(false);
      }} className="bg-gray-300 py-0.5 px-1 rounded">Cancel</button>
    </span>
  );
}

const graphSchema = z.object({
  vertices: z.object({
    position: z.number().array().length(2),
    type: z.enum(["Player 1", "Player 2"]),
    target: z.boolean(),
  }).array(),
  edges: z.object({
    endpoints: z.number().array().length(2),
    locks: z.number().array(),
    keys: z.number().array(),
  }).array(),
  start: z.number().nullable(),
  locks: z.object({
    color: z.string(),
    open: z.boolean(),
  }).array(),
});

interface Graph {
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

interface GraphEditorProps {
  graph: Graph,
  setGraph: Dispatch<SetStateAction<Graph>>,
  setView: Dispatch<SetStateAction<'editor' | 'game'>>,
}

function GraphEditor({ graph, setGraph, setView }: GraphEditorProps) {
  const svgContainer = useRef<HTMLDivElement>(null);
  const [svgDimensions, setSvgDimensions] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [drag, setDrag] = useState<null | {
    object: 'vertex',
    index: number,
    offsetFromInitialPosition: [number, number],
  } | {
    object: "none",
    initialPosition: [number, number],
    newVertexIndex: number,
  }>(null);
  const [selected, setSelected] = useState<null | {
    object: "vertex" | "edge",
    index: number,
  }>(null);
  const [addEdge, setAddEdge] = useState<null | number[]>(null);

  // Window resize
  useEffect(() => {
    const onResize = () => {
      const { x, y, width, height } = svgContainer.current!.getBoundingClientRect();
      setSvgDimensions({ x, y, width, height });
      setDrag(null);
    };

    onResize(); // Call to initialize the SVG dimensions

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Handle drag
  useEffect(() => {
    if (drag) {
      if (drag.object === "vertex") {
        const onMouseMove = (e: MouseEvent) => {
          setGraph(graph => ({
            ...graph,
            vertices: [
              ...graph.vertices.slice(0, drag.index),
              {
                ...graph.vertices[drag.index],
                position: [
                  e.clientX - svgDimensions.x - svgDimensions.width / 2 - drag.offsetFromInitialPosition[0],
                  e.clientY - svgDimensions.y - svgDimensions.height / 2 - drag.offsetFromInitialPosition[1],
                ]
              },
              ...graph.vertices.slice(drag.index + 1)
            ]
          }));
        };

        const onMouseUp = (e: MouseEvent) => {
          onMouseMove(e);
          setDrag(null);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };
      } else {
        let createVertex = true;

        const onMouseMove = (e: MouseEvent) => {
          let xDiff = e.clientX - svgDimensions.x - svgDimensions.width / 2 - drag.initialPosition[0];
          let yDiff = e.clientY - svgDimensions.y - svgDimensions.height / 2 - drag.initialPosition[1];
          if (Math.pow(xDiff, 2) + Math.pow(yDiff, 2) > 25) {
            createVertex = false;
          }
        };

        const onMouseUp = (e: MouseEvent) => {
          onMouseMove(e);
          if (createVertex) {
            setGraph(graph => ({
              ...graph,
              vertices: [
                ...graph.vertices,
                {
                  type: "Player 1",
                  position: drag.initialPosition,
                  target: false,
                }
              ]
            }));
            setSelected({
              object: "vertex",
              index: drag.newVertexIndex,
            });
          } else {
            setSelected(null);
          }
          setDrag(null);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        }
      }
    }
  }, [svgDimensions, drag, setGraph]);

  // We keep track of edges to later check if the reverse edge exists.
  const edges = new Set<number>();
  graph.edges.forEach(edge => {
    edges.add(edge.endpoints[0] * graph.vertices.length + edge.endpoints[1]);
  });

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <div className="w-80 p-3 border-r-2 overflow-auto">
        <div className="py-3 border-b-2 flex justify-between">
          <label htmlFor="fileInput" className="bg-gray-300 py-1 px-2 rounded">Open</label>
          <input type="file" accept="application/json"
            id="fileInput"
            onChange={async (e) => {
              const fileInput = e.target as HTMLInputElement;

              if (fileInput.files) {
                const text = await fileInput.files[0].text();
                const parseResult = graphSchema.safeParse(JSON.parse(text));

                if (parseResult.success) {
                  const graph = parseResult.data;

                  let valid = true;
                  if (graph.start !== null && graph.start >= graph.vertices.length) {
                    valid = false;
                  }
                  graph.edges.forEach(edge => {
                    if (edge.endpoints[0] >= graph.vertices.length 
                      || edge.endpoints[1] >= graph.vertices.length) {
                      valid = false;
                    }
                    edge.locks.forEach(lock => {
                      if (lock >= graph.locks.length) {
                        valid = false;
                      }
                    });
                    edge.keys.forEach(key => {
                      if (key >= graph.locks.length) {
                        valid = false;
                      }
                    })
                  });
                  if (!valid) {
                    return;
                  }

                  setGraph(graph as Graph);
                  setSelected(null);
                  setDrag(null);
                  setAddEdge(null);
                }
              }
            }} className="hidden" />
          <a onClick={(e: React.MouseEvent) => {
            const file = new File([JSON.stringify(graph)], "graph.json", {
              type: "application/json",
            });
            (e.target as HTMLAnchorElement).href = URL.createObjectURL(file);
          }} 
          download="graph.json" className="bg-gray-300 py-1 px-2 rounded">Save</a>
        </div>
        <div className="py-3 border-b-2 flex justify-between">
          <button onClick={() => {
            setGraph({
              vertices: [],
              edges: [],
              start: null,
              locks: [],
            });
            setDrag(null);
            setSelected(null);
            setAddEdge(null);
          }} className="bg-gray-300 py-1 px-2 rounded">Reset</button>
          <span>
            {graph.start !== null && (
              <button onClick={() => { setView('game'); }} className="bg-gray-300 py-1 px-2 rounded">Play</button>
            )}
          </span>
        </div>
        <div className="py-3 border-b-2">
          {addEdge === null && <button onClick={() => { setAddEdge([]); setSelected(null); }} className="bg-gray-300 py-1 px-2 rounded">Add edge</button>}
          {addEdge !== null && (
            <div className="flex justify-between items-center">
              <span>Adding edge</span>
              <button onClick={() => { setAddEdge(null); }} className="bg-gray-300 py-1 px-2 rounded">Cancel</button>
            </div>
          )}
        </div>
        {
          selected === null && (
            <div className="py-3">
              <div className="flex justify-between items-center mb-5">
                <span className="text-2xl font-bold">Locks</span>
                {graph.locks.length < LOCK_COLORS.length && addEdge === null && (
                  <button onClick={() => {
                    const color = LOCK_COLORS.find(color => graph.locks.findIndex(lock => lock.color === color) === -1)!;
                    setGraph({
                      ...graph,
                      locks: [
                        ...graph.locks,
                        {
                          color,
                          open: false,
                        }
                      ]
                    });
                  }} className="bg-gray-300 py-1 px-2 rounded">Create lock</button>
                )}
              </div>
              {graph.locks.map((lock, i) =>
                <div key={i} className="flex mb-1 justify-between">
                  <div className="flex gap-1">
                    <span>Lock {i + 1}</span>
                    <svg width="20px" height="22px" viewBox="-7.5 -7 20 22">
                      <Lock position={[0.0, 0.0]} color={graph.locks[i].color} open={graph.locks[i].open} />
                    </svg>
                  </div>
                  <span className="flex gap-1">
                    {addEdge === null && <>
                      <input type="checkbox" id={`isOpen${i}`} checked={lock.open} onChange={(e) => {
                        setGraph({
                          ...graph,
                          locks: [
                            ...graph.locks.slice(0, i),
                            {
                              ...lock,
                              open: e.target.checked,
                            },
                            ...graph.locks.slice(i + 1),
                          ]
                        });
                      }} />
                      <label htmlFor={`isOpen${i}`}>Open</label>
                    </>}
                  </span>
                  <span>
                    {addEdge === null && <button onClick={() => {
                      setGraph(
                        {
                          ...graph,
                          edges: graph.edges.map(edge => ({
                            ...edge,
                            // Remove lock/key and reduce the larger locks/keys by 1.
                            locks: edge.locks.filter(l => l != i).map(l => (l > i) ? l - 1 : l),
                            keys: edge.keys.filter(k => k != i).map(k => (k > i) ? k - 1 : k),
                          })),
                          locks: [...graph.locks.slice(0, i), ...graph.locks.slice(i + 1)],
                        }
                      );
                    }}><FaTrash /></button>}
                  </span>
                </div>)}
            </div>
          )
        }
        {
          selected !== null
          && selected.object === "edge"
          && (
            <div className="mt-3 space-y-3" key={selected.index}>
              <div className="flex justify-between">
                <button onClick={() => {
                  setSelected(null);
                }} className="bg-gray-300 py-1 px-2 rounded">Back</button>
              </div>
              <div className="flex justify-between">
                <span className="text-2xl font-bold">Edge</span>
                <button onClick={() => {
                  setDrag(null);
                  setSelected(null);
                  setGraph({
                    ...graph,
                    edges: [
                      ...graph.edges.slice(0, selected.index),
                      ...graph.edges.slice(selected.index + 1)
                    ],
                  });
                }}><FaTrash /></button>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-xl font-bold">Locks</span>
                  <SelectAndAdd choices={graph.locks.map((_, i) => {
                    return {
                      label: `Lock ${i + 1}`,
                      value: i,
                    };
                  }).filter(choice => !graph.edges[selected.index].locks.includes(choice.value))}
                    onChoose={(lock) => {
                      setGraph({
                        ...graph,
                        edges: [
                          ...graph.edges.slice(0, selected.index),
                          {
                            ...graph.edges[selected.index],
                            locks: [...graph.edges[selected.index].locks, lock],
                          },
                          ...graph.edges.slice(selected.index + 1),
                        ],
                      })
                    }} />
                </div>
                {graph.edges[selected.index].locks.map(lock =>
                  <div key={lock} className="flex mt-2 justify-between">
                    <div className="flex gap-2">
                      <span>Lock {lock + 1}</span>
                      <svg width="20px" height="22px" viewBox="-7.5 -7 20 22">
                        <Lock position={[0.0, 0.0]} color={graph.locks[lock].color} open={graph.locks[lock].open} />
                      </svg>
                    </div>
                    <button onClick={() => {
                      setGraph({
                        ...graph,
                        edges: [
                          ...graph.edges.slice(0, selected.index),
                          {
                            ...graph.edges[selected.index],
                            locks: graph.edges[selected.index].locks.filter(l => l != lock),
                          },
                          ...graph.edges.slice(selected.index + 1),
                        ]
                      })
                    }}><FaTrash /></button>
                  </div>)}
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-xl font-bold">Keys</span>
                  <SelectAndAdd choices={graph.locks.map((_, i) => {
                    return {
                      label: `Key ${i + 1}`,
                      value: i,
                    };
                  }).filter(choice => !graph.edges[selected.index].keys.includes(choice.value))}
                    onChoose={(key) => {
                      setGraph({
                        ...graph,
                        edges: [
                          ...graph.edges.slice(0, selected.index),
                          {
                            ...graph.edges[selected.index],
                            keys: [...graph.edges[selected.index].keys, key],
                          },
                          ...graph.edges.slice(selected.index + 1),
                        ],
                      })
                    }} />
                </div>
                {graph.edges[selected.index].keys.map(key =>
                  <div key={key} className="flex mt-2 justify-between">
                    <div className="flex gap-2">
                      <span>Key {key + 1}</span>
                      <svg width="10px" height="20px" viewBox="-5 -10 10 20">
                        <Key position={[0.0, 0.0]} color={graph.locks[key].color} />
                      </svg>
                    </div>
                    <button onClick={() => {
                      setGraph({
                        ...graph,
                        edges: [
                          ...graph.edges.slice(0, selected.index),
                          {
                            ...graph.edges[selected.index],
                            keys: graph.edges[selected.index].keys.filter(l => l != key),
                          },
                          ...graph.edges.slice(selected.index + 1),
                        ]
                      })
                    }}><FaTrash /></button>
                  </div>)}
              </div>
            </div>
          )
        }
        {
          selected !== null
          && selected.object === "vertex"
          && (
            <div className="mt-3 space-y-3">
              <div>
                <button onClick={() => {
                    setSelected(null);
                }} className="bg-gray-300 py-1 px-2 rounded">Back</button>
              </div>
              <div className="flex justify-between">
                <span className="text-2xl font-bold">Vertex</span>
                <button onClick={() => {
                  setDrag(null);
                  setSelected(null);
                  let newStart = graph.start;
                  if (graph.start !== null) {
                    if (graph.start === selected.index) {
                      newStart = null;
                    } else if (graph.start > selected.index) {
                      newStart = graph.start - 1;
                    }
                  }
                  setGraph({
                    ...graph,
                    vertices: [
                      ...graph.vertices.slice(0, selected.index),
                      ...graph.vertices.slice(selected.index + 1),
                    ],
                    edges: graph.edges
                      .filter(edge => !edge.endpoints.includes(selected.index))
                      .map(edge => ({
                        ...edge,
                        endpoints: edge.endpoints.map(v => (v > selected.index) ? v - 1 : v) as [number, number]
                      })),
                    start: newStart,
                  });
                }}><FaTrash /></button>
              </div>
              <div className="flex justify-between items-center my-5">
                {selected.index !== graph.start && (
                  <button onClick={() => {
                    setGraph({
                      ...graph,
                      start: selected.index,
                    });
                  }} className="bg-gray-300 py-0.5 px-1 rounded">Set as start vertex</button>
                )}
                {selected.index === graph.start && (
                  <span className="py-0.5">Start vertex</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span>{graph.vertices[selected.index].type}</span>
                <button onClick={() => {
                  setGraph({
                    ...graph,
                    vertices: [
                      ...graph.vertices.slice(0, selected.index),
                      {
                        ...graph.vertices[selected.index],
                        type: graph.vertices[selected.index].type === "Player 1" ? "Player 2" : "Player 1",
                      },
                      ...graph.vertices.slice(selected.index + 1)
                    ]
                  })
                }} className="bg-gray-300 py-1 px-2 rounded">Change player</button>
              </div>
              <div className="flex justify-between">
                <label htmlFor="target">Target</label>
                <input type="checkbox" id="target" checked={graph.vertices[selected.index].target} onChange={(e) => {
                  setGraph({
                    ...graph,
                    vertices: [
                      ...graph.vertices.slice(0, selected.index),
                      {
                        ...graph.vertices[selected.index],
                        target: !graph.vertices[selected.index].target,
                      },
                      ...graph.vertices.slice(selected.index + 1),
                    ]
                  });
                }} />
              </div>
            </div>
          )
        }
      </div>
      <div className="flex flex-grow" ref={svgContainer}>
        <svg className="w-full h-full" viewBox={`${-svgDimensions.width / 2} ${-svgDimensions.height / 2} ${svgDimensions.width} ${svgDimensions.height}`}
          onMouseDown={(e) => {
            if (e.button !== 0 || addEdge !== null) {
              return;
            }
            setDrag({
              object: "none",
              initialPosition: [
                e.clientX - svgDimensions.x - svgDimensions.width / 2,
                e.clientY - svgDimensions.y - svgDimensions.height / 2,
              ],
              newVertexIndex: graph.vertices.length,
            });
          }}>
          {graph.edges.map(({ endpoints: [v1, v2], locks, keys }, i) => {
            const onMouseDown = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (e.button !== 0 || addEdge !== null) {
                return;
              }
              setSelected({
                object: "edge",
                index: i
              });
            }

            const isSelected = selected !== null && selected.object === "edge" && selected.index === i;
            let color = "black";
            if (isSelected) {
              color = "#f59e0b";
            } else if (addEdge !== null) {
              color = "gray";
            }

            return <Edge key={i} color={color} endpoints={[graph.vertices[v1].position, graph.vertices[v2].position]}
                          locks={locks.map(lock => graph.locks[lock])}
                          keys={keys.map(key => ({ color: graph.locks[key].color }))}
                          onMouseDown={onMouseDown} type={(edges.has(graph.vertices.length * v2 + v1) || v1 === v2) ? 'curve' : 'line'}/>;
          })}
          {graph.vertices.map((vertex, i) => {
            const onMouseDown = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (e.button !== 0) {
                return;
              }
              if (addEdge !== null) {
                // Selecting edge
                const newAddEdge = [...addEdge, i];
                if (newAddEdge.length < 2) {
                  setAddEdge(newAddEdge);
                }
                else {
                  setAddEdge(null);
                  if (graph.edges.findIndex(({ endpoints }) =>
                    endpoints[0] === newAddEdge[0] && endpoints[1] === newAddEdge[1]
                  ) === -1) {
                    setGraph({
                      ...graph,
                      edges: [...graph.edges, {
                        endpoints: newAddEdge as [number, number],
                        locks: [],
                        keys: [],
                      }]
                    });
                    setSelected({
                      object: "edge",
                      index: graph.edges.length,
                    });
                  }
                }
              } else {
                // Selecting vertex
                const offsetFromInitialPosition = [
                  e.clientX - svgDimensions.x - svgDimensions.width / 2 - vertex.position[0],
                  e.clientY - svgDimensions.y - svgDimensions.height / 2 - vertex.position[1],
                ] as [number, number];
                setDrag({
                  object: "vertex",
                  index: i,
                  offsetFromInitialPosition,
                });
                setSelected({
                  object: "vertex",
                  index: i,
                });
              }
            };

            const isSelected = selected !== null && selected.object === "vertex" && selected.index === i;
            let color = "black";
            if (isSelected) {
              color = "#f59e0b";
            } else if (addEdge !== null) {
              if (addEdge.includes(i)) {
                color = "#f59e0b";
              } else {
                color = "gray";
              }
            } else if (graph.start === i) {
              color = "#e11d48";
            } else if (vertex.target) {
              color = "#0284c7";
            }

            if (vertex.type === "Player 1") {
              return <circle key={i}
                cx={vertex.position[0]} cy={vertex.position[1]} r="10"
                fill={color}
                onMouseDown={onMouseDown} onDragStart={(e) => { e.preventDefault(); }} />;
            }
            else {
              return <rect key={i}
                x={vertex.position[0] - 10} y={vertex.position[1] - 10} width="20" height="20"
                fill={color}
                onMouseDown={onMouseDown} onDragStart={(e) => { e.preventDefault(); }} />;
            }
          })}
        </svg>
      </div>
    </div>
  );
}

interface GameProps {
  graph: Graph,
  setView: Dispatch<SetStateAction<'editor' | 'game'>>,
}

function Game({ graph, setView }: GameProps) {
  const [svgDimensions, setSvgDimensions] = useState([0, 0, 0, 0]);
  const [isOpen, setIsOpen] = useState(graph.locks.map(lock => lock.open));
  const [position, setPosition] = useState(graph.start!);
  const [targetReached, setTargetReached] = useState(graph.vertices[graph.start!].target);

  // Window resize
  useEffect(() => {
    const onResize = () => {
      const rect = document.querySelector('#svgContainer')!.getBoundingClientRect();
      setSvgDimensions([rect.x, rect.y, rect.width, rect.height]);
    };

    onResize(); // Call to initialize the SVG dimensions

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  let gameText = '';
  if (targetReached) {
    gameText = 'Target reached';
  } else {
    gameText = `${graph.vertices[position].type}'s turn`;
  }

  // We keep track of edges to later check if the reverse edge exists.
  const edges = new Set<number>();
  graph.edges.forEach(edge => {
    edges.add(edge.endpoints[0] * graph.vertices.length + edge.endpoints[1]);
  });

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      <div className="w-full p-3 flex justify-between">
        <button className="bg-gray-300 py-1 px-2 rounded" onClick={() => { setView('editor'); }}>Back</button>
        <span className="text-3xl font-bold">{gameText}</span>
        <button className="bg-gray-300 py-1 px-2 rounded" onClick={() => { 
          setIsOpen(graph.locks.map(lock => lock.open));
          setPosition(graph.start!);
          setTargetReached(graph.vertices[graph.start!].target);
        }}>Reset</button>
      </div>
      <div className="w-full flex-grow overflow-hidden" id="svgContainer">
        <svg className="w-full h-full"
            viewBox={`${-svgDimensions[2] / 2} ${-svgDimensions[3] / 2} ${svgDimensions[2]} ${svgDimensions[3]}`}>
          {graph.edges.map(({ endpoints: [v1, v2], locks, keys }, i) => (
            <Edge key={i} color={"black"} endpoints={[graph.vertices[v1].position, graph.vertices[v2].position]}
              locks={locks.map(lock => ({
                color: graph.locks[lock].color,
                open: isOpen[lock],
              }))}
              keys={keys.map(key => ({ color: graph.locks[key].color }))}
              type={(edges.has(graph.vertices.length * v2 + v1) || v1 === v2) ? 'curve' : 'line'}
              onMouseDown={() => {
                if (targetReached) {
                  return;
                }
                if (v1 === position && locks.every(lock => isOpen[lock])) {
                    const newIsOpen = [...isOpen];
                    keys.forEach(key => {
                      newIsOpen[key] = !newIsOpen[key];
                    });
                    setIsOpen(newIsOpen);
                    setPosition(v2);
                    setTargetReached(targetReached || graph.vertices[v2].target);
                }
              }}/>
          ))}
          {graph.vertices.map((vertex, i) => {
            const onMouseDown = () => {
              graph.edges.forEach(edge => {
                if (targetReached) {
                  return;
                }
                if (edge.endpoints[0] === position && edge.endpoints[1] === i && edge.locks.every(lock => isOpen[lock])) {
                    const newIsOpen = [...isOpen];
                    edge.keys.forEach(key => {
                      newIsOpen[key] = !newIsOpen[key];
                    });
                    setIsOpen(newIsOpen);
                    setPosition(i);
                    setTargetReached(targetReached || vertex.target);
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
              className="pointer-events-none" fill="#4c1d95"/>
          )}
          {graph.vertices[position].type === "Player 2" && (
            <rect x={graph.vertices[position].position[0] - 15} y={graph.vertices[position].position[1] - 15} width="30" height="30"
              className="pointer-events-none" fill="#4c1d95"/>
          )}
        </svg>
      </div>
    </div>
  );
}

export default function Home() {
  const [graph, setGraph] = useState<Graph>({
    vertices: [],
    edges: [],
    start: null,
    locks: [],
  });
  const [view, setView] = useState<'editor' | 'game'>('editor');

  if (view === 'editor') {
    return <GraphEditor graph={graph} setGraph={setGraph} setView={setView}/>;
  }
  else {
    return <Game graph={graph} setView={setView}/>
  }
}
