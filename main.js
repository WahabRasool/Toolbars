import React, { createContext, StrictMode, useContext, useRef, useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";
import useWebAnimations from "https://esm.sh/@wellyshen/use-web-animations";
const ToolbarContext = createContext(undefined);
const ToolbarProvider = ({ children }) => {
    const [tool, setTool] = useState("select");
    return (React.createElement(ToolbarContext.Provider, { value: { tool, setTool } }, children));
};
const useTool = () => {
    const context = useContext(ToolbarContext);
    if (!context) {
        throw new Error("useTool must be used inside ToolbarProvider");
    }
    return context;
};
createRoot(document.getElementById("root")).render(React.createElement(StrictMode, null,
    React.createElement("main", null,
        React.createElement(ToolbarIconSprites, null),
        React.createElement(ToolbarProvider, null,
            React.createElement(Toolbar, { name: "Horizontal" })),
        React.createElement(ToolbarProvider, null,
            React.createElement(Toolbar, { name: "Vertical", orientation: "vertical" })))));
function Toolbar({ name, orientation = "horizontal" }) {
    const { tool, setTool } = useTool();
    const [toolPrev, setToolPrev] = useState(tool);
    const toolbarRef = useRef(null);
    const { ref, animate } = useWebAnimations();
    const isRTL = document.dir === "rtl";
    const isVertical = orientation === "vertical";
    const tools = [
        {
            icon: "select",
            label: "Select",
            tool: "select"
        },
        {
            icon: "draw",
            label: "Draw",
            tool: "draw"
        },
        {
            icon: "fill",
            label: "Fill",
            tool: "fill"
        },
        {
            icon: "erase",
            label: "Erase",
            tool: "erase"
        }
    ];
    function handleKeyDown(e) {
        var _a;
        const toolButtons = (_a = toolbarRef.current) === null || _a === void 0 ? void 0 : _a.querySelectorAll("[tabindex]");
        if (!toolButtons)
            return;
        const toolIndex = tools.findIndex(item => item.tool === tool);
        const forward = () => {
            e.preventDefault();
            const nextToolIndex = (toolIndex + 1) % tools.length;
            const toolName = tools[nextToolIndex].tool;
            setTool(() => {
                reAnimate(toolName);
                return toolName;
            });
            toolButtons[nextToolIndex].focus();
        };
        const backward = () => {
            e.preventDefault();
            let prevToolIndex = toolIndex - 1;
            if (prevToolIndex < 0)
                prevToolIndex = tools.length - 1;
            const toolName = tools[prevToolIndex].tool;
            setTool(() => {
                reAnimate(toolName);
                return toolName;
            });
            toolButtons[prevToolIndex].focus();
        };
        switch (e.code) {
            case "ArrowRight": {
                if (isRTL) {
                    backward();
                }
                else {
                    forward();
                }
                break;
            }
            case "ArrowDown": {
                forward();
                break;
            }
            case "ArrowLeft": {
                if (isRTL) {
                    forward();
                }
                else {
                    backward();
                }
                break;
            }
            case "ArrowUp": {
                backward();
                break;
            }
            case "Home": {
                e.preventDefault();
                const toolName = tools[0].tool;
                setTool(() => {
                    reAnimate(toolName);
                    return toolName;
                });
                toolButtons[0].focus();
                break;
            }
            case "End": {
                e.preventDefault();
                const toolName = tools[tools.length - 1].tool;
                setTool(() => {
                    reAnimate(toolName);
                    return toolName;
                });
                toolButtons[tools.length - 1].focus();
                break;
            }
            default:
                break;
        }
    }
    ;
    function reAnimate(tool) {
        const toolIndex = tools.findIndex(item => item.tool === tool);
        const toolPrevIndex = tools.findIndex(item => item.tool === toolPrev);
        const highlightWidth = 1.75;
        const highlightMoveIncrement = 1.875;
        const highlightmoveA = highlightMoveIncrement * toolPrevIndex;
        const highlightmoveB = highlightMoveIncrement * toolIndex;
        const indexIsLower = toolIndex < toolPrevIndex;
        const moveA = `${highlightmoveA}em`;
        const moveB = `${highlightmoveB}em`;
        const move = indexIsLower ? [moveA, moveB, moveB] : [moveA, moveA, moveB];
        const widthA = `${highlightWidth}em`;
        const widthB = `${highlightWidth + highlightMoveIncrement * Math.abs(toolIndex - toolPrevIndex)}em`;
        const width = [widthA, widthB, widthA];
        const moveKeyframes = isVertical ? { top: move } : (isRTL ? { right: move } : { left: move });
        const widthKeyframes = isVertical ? { height: width } : { width };
        animate({
            id: "move",
            keyframes: Object.assign(Object.assign({}, moveKeyframes), widthKeyframes),
            animationOptions: {
                duration: 300,
                easing: "cubic-bezier(0.65,0,0.35,1)",
                fill: "forwards"
            }
        });
        setToolPrev(tool);
    }
    return (React.createElement("div", { className: `toolbar${isVertical ? " toolbar--vertical" : ""}`, role: "toolbar", "aria-label": name, "aria-orientation": orientation, onKeyDown: handleKeyDown, ref: toolbarRef },
        tools.map((item, i) => {
            const { icon, label, tool } = item;
            return (React.createElement(ToolbarButton, { label: label, toolName: tool, toolChangeEffect: reAnimate, key: i },
                React.createElement(ToolbarIcon, { icon: icon })));
        }),
        React.createElement("div", { className: "toolbar__highlight", ref: ref })));
}
function ToolbarButton({ label, toolName, toolChangeEffect, children }) {
    const { tool, setTool } = useTool();
    const pressed = toolName === tool;
    function runtoolChangeEffect() {
        setTool(() => {
            toolChangeEffect(toolName);
            return toolName;
        });
    }
    return (React.createElement("button", { className: "toolbar__button", type: "button", "aria-label": label, "aria-pressed": pressed, tabIndex: pressed ? 0 : -1, onClick: runtoolChangeEffect },
        children,
        React.createElement("span", { className: "toolbar__button-tip" }, label)));
}
function ToolbarIcon({ icon }) {
    return (React.createElement("svg", { className: "toolbar__icon", width: "16px", height: "16px", "aria-hidden": "true" },
        React.createElement("use", { href: `#${icon}` })));
}
function ToolbarIconSprites() {
    return (React.createElement("svg", { width: "0", height: "0", "aria-hidden": "true" },
        React.createElement("symbol", { id: "select", viewBox: "0 0 24 24" },
            React.createElement("polygon", { fill: "currentcolor", stroke: "currentcolor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", points: "12 4,5 20,12 16,19 20", transform: "translate(0,0) rotate(-30,12,12)" })),
        React.createElement("symbol", { id: "draw", viewBox: "0 0 24 24" },
            React.createElement("g", { fill: "currentColor" },
                React.createElement("path", { d: "M17.0671 2.27157C17.5 2.09228 17.9639 2 18.4324 2C18.9009 2 19.3648 2.09228 19.7977 2.27157C20.2305 2.45086 20.6238 2.71365 20.9551 3.04493C21.2864 3.37621 21.5492 3.7695 21.7285 4.20235C21.9077 4.63519 22 5.09911 22 5.56761C22 6.03611 21.9077 6.50003 21.7285 6.93288C21.5492 7.36572 21.2864 7.75901 20.9551 8.09029L20.4369 8.60845L15.3916 3.56308L15.9097 3.04493C16.241 2.71365 16.6343 2.45086 17.0671 2.27157Z" }),
                React.createElement("path", { d: "M13.9774 4.9773L3.6546 15.3001C3.53154 15.4231 3.44273 15.5762 3.39694 15.7441L2.03526 20.7369C1.94084 21.0831 2.03917 21.4534 2.29292 21.7071C2.54667 21.9609 2.91693 22.0592 3.26314 21.9648L8.25597 20.6031C8.42387 20.5573 8.57691 20.4685 8.69996 20.3454L19.0227 10.0227L13.9774 4.9773Z" }))),
        React.createElement("symbol", { id: "fill", viewBox: "0 -32 576 576" },
            React.createElement("g", { fill: "currentColor" },
                React.createElement("path", { d: "M512 320s-64 92.65-64 128c0 35.35 28.66 64 64 64s64-28.65 64-64-64-128-64-128zm-9.37-102.94L294.94 9.37C288.69 3.12 280.5 0 272.31 0s-16.38 3.12-22.62 9.37l-81.58 81.58L81.93 4.76c-6.25-6.25-16.38-6.25-22.62 0L36.69 27.38c-6.24 6.25-6.24 16.38 0 22.62l86.19 86.18-94.76 94.76c-37.49 37.48-37.49 98.26 0 135.75l117.19 117.19c18.74 18.74 43.31 28.12 67.87 28.12 24.57 0 49.13-9.37 67.87-28.12l221.57-221.57c12.5-12.5 12.5-32.75.01-45.25zm-116.22 70.97H65.93c1.36-3.84 3.57-7.98 7.43-11.83l13.15-13.15 81.61-81.61 58.6 58.6c12.49 12.49 32.75 12.49 45.24 0s12.49-32.75 0-45.24l-58.6-58.6 58.95-58.95 162.44 162.44-48.34 48.34z" }))),
        React.createElement("symbol", { id: "erase", viewBox: "0 0 24 24" },
            React.createElement("g", { fill: "currentColor" },
                React.createElement("path", { d: "M21.0302 22H13.9902C13.5702 22 13.2402 21.66 13.2402 21.25C13.2402 20.84 13.5802 20.5 13.9902 20.5H21.0302C21.4502 20.5 21.7802 20.84 21.7802 21.25C21.7802 21.66 21.4502 22 21.0302 22Z" }),
                React.createElement("path", { d: "M13.64 16.6894C14.03 17.0794 14.03 17.7094 13.64 18.1094L10.66 21.0894C9.55 22.1994 7.77 22.2594 6.59 21.2694C6.52 21.2094 6.46 21.1494 6.4 21.0894L5.53 20.2194L3.74 18.4294L2.88 17.5694C2.81 17.4994 2.75 17.4294 2.69 17.3594C1.71 16.1794 1.78 14.4194 2.88 13.3194L5.86 10.3394C6.25 9.94938 6.88 9.94938 7.27 10.3394L13.64 16.6894Z" }),
                React.createElement("path", { d: "M21.1194 10.6414L16.1194 15.6414C15.7294 16.0314 15.0994 16.0314 14.7094 15.6414L8.33937 9.29141C7.94938 8.90141 7.94938 8.27141 8.33937 7.87141L13.3394 2.88141C14.5094 1.71141 16.4294 1.71141 17.5994 2.88141L21.1194 6.39141C22.2894 7.56141 22.2894 9.47141 21.1194 10.6414Z" })))));
}
;
