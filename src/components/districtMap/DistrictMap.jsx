import { useState, useEffect } from "react";
import * as d3 from "d3";
import "./DistrictMap.scss";
const width = 900;
const height = 900;

const DistrictMap = () => {
  const [data, setData] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetch("/India_AC.geojson")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return <p>Loading...</p>;

  //   const districtName = name?.name;

  const districtFeatures = data.features.filter(
    (f) =>
      f.properties?.ST_NAME && f.properties.ST_NAME.trim() === "MAHARASHTRA",
  );

  const district = {
    type: "FeatureCollection",
    features: districtFeatures,
  };

  // ✅ THIS IS THE KEY FIX
  const projection = d3
    .geoIdentity()
    .reflectY(true)
    .fitSize([width, height], district);

  const path = d3.geoPath().projection(projection);

  const highlightMap = (name) => {
    const highlight = district.features?.filter(
      (item) => item?.properties?.AC_NAME === name,
    );

    const hoverdIndex = highlight[0]?.properties?.AC_NAME;

    setHovered(hoverdIndex);
  };

  return (
    <div class="map_parent">
      <svg width={width} height={height} style={{ background: "#eee" }}>
        {district.features.map((f, i) => {
          const [x, y] = path.centroid(f); // 👈 calculate for each feature

          return (
            <g key={i}>
              {/* District Shape */}
              <path
                d={path(f)}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(f?.properties?.AC_NAME)}
                onMouseLeave={() => setHovered(null)}
                stroke="black"
                fill={
                  hovered === f?.properties?.AC_NAME ? "#ff5722" : "transparent"
                }
              />

              {/* District Name */}
              <text
                x={x}
                y={y}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="black" // ✅ text color here
                fontSize="12"
                pointerEvents="none"
              >
                {f?.properties?.AC_NO}
              </text>
            </g>
          );
        })}
      </svg>
      <div class="search_input">
        <div class="input">
          <input
            
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter Vidhansabha"
          />
        </div>
        <div class="list">
          <ul>
            {district.features
              ?.filter((item) =>
                item?.properties?.AC_NAME?.toLowerCase().includes(
                  search.toLowerCase(),
                ),
              )
              .map((item, index) => (
                <li
                  onClick={() => highlightMap(item?.properties?.AC_NAME)}
                  key={index}
                >
                  {item?.properties?.AC_NAME}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DistrictMap;
