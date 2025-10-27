import React from "react";

export default function Accept() {
    const props = {
        type: "submit",
        className: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",
        text: "Accept"
    };
    
    return (
        <button className={props.className}>
            {props.text}
        </button>
    );
}