import { useEffect, useRef, useState } from "react";
import { districtData } from "../data/districtData";
import "./map.scss";
import DistrictMap from "./districtMap/DistrictMap";

export default function Map() {
  const mapRef = useRef();
  const districtElements = useRef({}); // store svg elements
  const [search, setSearch] = useState("");
  // const [districtName, setDistrictName] = useState("");
  const [infoHTML, setInfoHTML] = useState(`
      <h3>District Info</h3>
      <p>Click on a district to select</p>
  `);

  /* =========================
     SEARCH FUNCTION
  ========================= */
  function handleSearch(value) {
    setSearch(value);

    const BASE = "#eaeaea";
    const SELECTED = "#ff5722";

    const districtName = Object.keys(districtElements.current).find((d) =>
      d.toLowerCase().includes(value.toLowerCase()),
    );

    if (!districtName) return;

    const el = districtElements.current[districtName];
    const number =
      Object.keys(districtElements.current).indexOf(districtName) + 1;

    // reset all colors
    Object.values(districtElements.current).forEach((p) => {
      p.style.fill = BASE;
    });

    // highlight selected
    el.style.fill = SELECTED;

    // show info
    const list = districtData[districtName] || [];
    setInfoHTML(`
        <h3>${number}. ${districtName}</h3>
        <ul>${list.map((v) => `<li>${v}</li>`).join("")}</ul>
    `);
  }

  /* =========================
     PALGHAR SPECIAL DATA
  ========================= */
  function showPalgharData() {
    const list = districtData["Palghar"] || [];
    setInfoHTML(`
      <h3>36. Palghar <span style="color:#ff5722;font-size:12px">(Created 2014)</span></h3>
      <ul>${list.map((v) => `<li>${v}</li>`).join("")}</ul>
      <p style="font-size:11px;color:#666;font-style:italic">
      * Not visible on 2011 map (was part of Thane district)
      </p>
    `);
  }

  /* =========================
     MAP LOAD
  ========================= */
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
        "Ahmednagar",
        "Akola",
        "Amravati",
        "Aurangabad",
        "Bhandara",
        "Beed",
        "Buldhana",
        "Chandrapur",
        "Dhule",
        "Gadchiroli",
        "Gondia",
        "Hingoli",
        "Jalgaon",
        "Jalna",
        "Kolhapur",
        "Latur",
        "Mumbai City",
        "Mumbai Suburban",
        "Nagpur",
        "Nanded",
        "Nandurbar",
        "Nashik",
        "Osmanabad",
        "Parbhani",
        "Pune",
        "Raigad",
        "Ratnagiri",
        "Sangli",
        "Satara",
        "Sindhudurg",
        "Solapur",
        "Thane",
        "Wardha",
        "Washim",
        "Yavatmal",
        "Palghar",
      ];

      const paths = svg.querySelectorAll("path");

      paths.forEach((el, index) => {
        const name = districtOrder[index];
        const number = index + 1;

        districtElements.current[name] = el; // store element

        el.style.fill = BASE;
        el.style.stroke = "#333";
        el.style.strokeWidth = "0.6";
        el.style.cursor = "pointer";

        /* LABEL */
        const bbox = el.getBBox();
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        text.setAttribute("x", bbox.x + bbox.width / 2);
        text.setAttribute("y", bbox.y + bbox.height / 2);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.style.fontSize = "14px";
        text.style.fontWeight = "bold";
        text.textContent = `${number} / ${name}`;
        el.parentNode.appendChild(text);

        /* PALGHAR MARKER */
        if (name === "Thane") {
          const circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle",
          );
          circle.setAttribute("cx", bbox.x + bbox.width * 0.3);
          circle.setAttribute("cy", bbox.y + bbox.height * 0.3);
          circle.setAttribute("r", "8");
          circle.style.fill = "#4CAF50";
          circle.style.cursor = "pointer";
          el.parentNode.appendChild(circle);
          circle.addEventListener("click", showPalgharData);
        }

        /* HOVER */
        el.addEventListener("mouseenter", () => {
          if (el !== selectedEl) el.style.fill = HOVER;
          if (!selectedEl) showData(name, number);
        });

        el.addEventListener("mouseleave", () => {
          if (el !== selectedEl) el.style.fill = BASE;
        });

        /* CLICK */
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
            // setDistrictName(name);
          }
        });
      });

      function showData(name, number) {
        const list = districtData[name] || [];
        setInfoHTML(`
          <h3>${number}. ${name}</h3>
          <ul>${list.map((v) => `<li>${v}</li>`).join("")}</ul>
        `);
      }
    };

    obj.addEventListener("load", onLoad);
  }, []);





  /* =========================
     UI
  ========================= */
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
          
      
         

          <div className="right-data">
            <input
              type="search"
              placeholder="Search district..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <div
              id="info-panel"
              dangerouslySetInnerHTML={{ __html: infoHTML }}
            />
          </div>
        </div>

        <div className="map-note">
          📌 Note: 2011 district boundaries. Palghar created in 2014 from Thane.
        </div>
      </div>
    </>
  );
}
