import { useEffect, useRef, useState } from "react";
import { districtData } from "../data/districtData";
import "./map.scss"
export default function Map() {
    const mapRef = useRef();
    const [infoHTML, setInfoHTML] = useState(`
      <h3>District Info</h3>
      <p>Click on a district to select</p>
  `);

    function showPalgharData() {
        const list = districtData["Palghar"] || [];
        setInfoHTML(`
      <h3>36. Palghar <span style="color:#ff5722;font-size:12px">(Created 2014)</span></h3>
      <ul>${list.map(v => `<li>${v}</li>`).join("")}</ul>
      <p style="font-size:11px;color:#666;font-style:italic">
      * Not visible on 2011 map (was part of Thane district)
      </p>
    `);
    }

    useEffect(() => {
        const obj = mapRef.current;

        const onLoad = () => {
            const svg = obj.contentDocument;
            if (!svg) return;

            let selectedEl = null;

            const BASE = "#eaeaea";
            const HOVER = "orange";
            const SELECTED = "#ff5722";

            const districtOrder = [
                "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Bhandara",
                "Beed", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli",
                "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur",
                "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
                "Nandurbar", "Nashik", "Osmanabad", "Parbhani", "Pune",
                "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg",
                "Solapur", "Thane", "Wardha", "Washim", "Yavatmal", "Palghar"
            ];

            const paths = svg.querySelectorAll("path");

            paths.forEach((el, index) => {
                const name = districtOrder[index];
                const number = index + 1;

                el.style.fill = BASE;
                el.style.stroke = "#333";
                el.style.strokeWidth = "0.6";
                el.style.cursor = "pointer";

                /* Add number label */
                const bbox = el.getBBox();
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", bbox.x + bbox.width / 2);
                text.setAttribute("y", bbox.y + bbox.height / 2);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "middle");
                text.style.fontSize = "14px";
                text.style.fontWeight = "bold";
                text.textContent =` ${number} / ${name}`;
                el.parentNode.appendChild(text);

                /* Palghar marker near Thane */
                if (name === "Thane") {
                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute("cx", bbox.x + bbox.width * 0.3);
                    circle.setAttribute("cy", bbox.y + bbox.height * 0.3);
                    circle.setAttribute("r", "8");
                    circle.style.fill = "#4CAF50";
                    circle.style.cursor = "pointer";
                    el.parentNode.appendChild(circle);
                    circle.addEventListener("click", showPalgharData);
                }

                /* Hover */
                el.addEventListener("mouseenter", () => {
                    if (el !== selectedEl) el.style.fill = HOVER;
                    if (!selectedEl) showData(name, number);
                });

                el.addEventListener("mouseleave", () => {
                    if (el !== selectedEl) el.style.fill = BASE;
                });

                /* Click */
                el.addEventListener("click", () => {
                    if (selectedEl && selectedEl !== el) {
                        selectedEl.style.fill = BASE;
                    }

                    if (selectedEl === el) {
                        el.style.fill = BASE;
                        selectedEl = null;
                    } else {
                        el.style.fill = SELECTED;
                        selectedEl = el;
                        showData(name, number);
                    }
                });
            });

            function showData(name, number) {
                const list = districtData[name] || [];
                setInfoHTML(`
          <h3>${number}. ${name}</h3>
          <ul>${list.map(v => `<li>${v}</li>`).join("")}</ul>
        `);
            }
        };

        obj.addEventListener("load", onLoad);
    }, []);

    return (
        <>
            <div className="map-parent parent">
                <h2>Map of Maharashtra Districts with Assembly</h2>
                <div className="map-cont cont">

                    <object
                        ref={mapRef}
                        id="map"
                        data="/2011_Dist.svg"
                        type="image/svg+xml"
                    />

                    <div id="info-panel" dangerouslySetInnerHTML={{ __html: infoHTML }} />

                   
                </div>
                 <div className="map-note">
                        📌 Note: 2011 district boundaries.
                        Palghar created in 2014 from Thane.
                    </div>
            </div>

        </>
    );
}