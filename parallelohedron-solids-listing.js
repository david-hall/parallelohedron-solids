import { models } from './parallelohedron-solids-models.js';

let camera = true;
let selectedRow;
const searchParams = new URL(document.location).searchParams;
const table = document.getElementById( "partsTable" );
const tbody = table.createTBody();
const viewer = document.getElementById( "viewer" );
const showEdges = document.getElementById( "showEdges" );

viewer .addEventListener( "vzome-scenes-discovered", (e) => {
  // Just logging this to the console for now. Not actually using the scenes list.
  const scenes = e.detail;
  //console.log( "These scenes were discovered in " + viewer.src);
  console.log( JSON.stringify( scenes, null, 2 ) );
} );

for (const psolid of models) {
  const tr = tbody.insertRow();
  fillRow(tr, psolid);
  tr.addEventListener("click", () => selectParallelohedronSolid( psolid, tr ) );
}

var initialId = 1;
let pId = parseInt(searchParams.get("P")); // upper case
if(Number.isNaN(pId)) {
	pId = parseInt(searchParams.get("p")); // lower case
}
if(pId >= 1 && pId <= 90) {
	initialId = pId;
}
const initialRow = tbody.rows[ initialId - 1 ];
selectParallelohedronSolid( models[ initialId - 1 ], initialRow );
initialRow.scrollIntoView({ behavior: "smooth", block: "center" });

showEdges.addEventListener("change", // use "change" here, not "click"
  () => {
    setScene(selectedRow.dataset);
  } );

function selectParallelohedronSolid( psolid, tr ) {
	if(tr != selectedRow) {
	  const { url, id } = psolid;
		if(url) {
		  if ( selectedRow ) {
			selectedRow.className = "";
		  }
		  selectedRow = tr;
		  selectedRow.className = "selected";
		  document.getElementById( "index" ).textContent = "P" +id;
		  switchModel(psolid);
	  } else {
		  alert("Parallelohedron-solid" + id + " is not yet available.\n\nPlease help us collect the full set.");
	  }
	}
}

function fillRow(tr, psolid) {
  const { id, title, field, url, edgescene, facescene, zometool } = psolid;
  // Data attribute names must be prefixed with 'data-' and should not contain any uppercase letters,
  tr.setAttribute("data-field", field);
  tr.setAttribute("data-edgescene", edgescene);
  tr.setAttribute("data-facescene", facescene);
  tr.setAttribute("data-zometool", !!zometool);
  if(!tr.id) {
    tr.id = "psolid-" + id;
  }
  // Id column
  let td = tr.insertCell();
  td.className = url ? "ident done" : "ident todo";
  td.innerHTML = "P" + id;
  // title column
  td = tr.insertCell();
  td.className = "title";
  if(field == "Golden" && zometool == "true" && url) {
    td.className += " zometool";
  }
  if(!!title) {
    td.innerHTML = title;  
  }
}

function switchModel( psolid ) {
  viewer.src = psolid.url;
  setScene( psolid );
}

// After the first design is initially rendered, 
// we don't want to update the camera position with each scene change
viewer .addEventListener( "vzome-design-rendered", (e) => {
	camera = false;
},
{once: true}); // automatically remove this listener after it is fired once

function setScene( psolidSceneData ) {
  // psolidSceneData may be a psolid object from the JSON
  /// or it may be selectedRow.dataset.
  // Either one should have these properties, all in lower case
  const { field, edgescene, facescene, zometool } = psolidSceneData;
  const scene = (field == "Golden" && zometool == "true") && showEdges.checked ? edgescene : facescene;
  viewer.scene = scene;
  viewer.update({ camera });
}
