import { models } from './parallelepiped-models.js';

let camera = true;
let selectedRow;
const searchParams = new URL(document.location).searchParams;
const noScenes = (searchParams.get("no-scenes") != null)
const table = document.getElementById( "partsTable" );
const tbody = table.createTBody();
const viewer = document.getElementById( "viewer" );
const showEdges = document.getElementById( "showEdges" );

// After the first design is initially rendered,  
// we don't want to update the camera position with each scene change 
viewer .addEventListener( "vzome-design-rendered", (e) => {
  // console.log({camera})
  camera = false; 
}, 
{once: true}); // automatically remove this listener after it is fired once 

viewer .addEventListener( "vzome-scenes-discovered", (e) => {
  // Just logging this to the console for now. Not actually using the scenes list.
  const scenes = e.detail;
  // console.log( "These scenes were discovered in " + viewer.src);
  console.log( JSON.stringify( scenes, null, 2 ) );
} );

{ // limit the scope for the id variable
  let id = 1
  for (const psolid of models) {
    const tr = tbody.insertRow();
    tr.setAttribute('tabindex','0') // Don't increment the tabindex. Leave them all at 0.
    fillRow(tr, psolid, id++);
    tr.addEventListener("click", () => selectParallelohedronSolid( psolid, tr ) );
    tr.addEventListener("keydown", (event) => {
      if (event.keyCode === 13) { // enter key
        selectParallelohedronSolid( psolid, tr );
        event.preventDefault();
      }
    } )
  }
}

var initialId = 1;
let pId = parseInt(searchParams.get("P")); // upper case
if(Number.isNaN(pId)) {
	pId = parseInt(searchParams.get("p")); // lower case
}
if(pId >= 1 && pId <= models.length) {
	initialId = pId;
}
const initialRow = tbody.rows[ initialId - 1 ];
selectParallelohedronSolid( models[ initialId - 1 ], initialRow );
initialRow.scrollIntoView({ behavior: "smooth", block: "center" });

if(noScenes){
  const zomeSwitch = document.getElementById( "zome-switch" )
  if(!! zomeSwitch) {
    zomeSwitch.className = "no-zome"
  }
} else {
  showEdges.addEventListener("change", () => setScene() ) // use "change" here, not "click"
}

function selectParallelohedronSolid( psolid, tr ) {
	if(tr != selectedRow) {
    const { title, url } = psolid;
		if(url) {
		  if ( selectedRow ) {
			  selectedRow.className = "";
		  }
		  selectedRow = tr;
		  selectedRow.className = "selected";
		  document.getElementById( "index" ).textContent = title;
		  switchModel(url);
	  } else {
		  alert(`Parallelohedron ${title} is not yet available.\n\nPlease help us collect the full set.`);
	  }
	}
}

function fillRow(tr, psolid, id) {
  const {title} = psolid;
  if(!tr.id) {
    tr.id = "psolid-" + id;
  }
  // Id column
  let td = tr.insertCell();
  td.className = "ident done";
  td.innerHTML = `P${id}`
  // title column
  td = tr.insertCell();
  td.className = "title";
  if(!!title) {
    td.innerHTML = title;  
  }
  addFaceColumns(tr, title);
  addStrutColumns(tr, title);
}

function addFaceColumns(tr, title) {
  const characters = [...title];
  for(let i = 0; i < 3; i++) {
    let td = tr.insertCell();
    if(i < characters.length && "ABCDEFGHIJKLMNOP".includes(characters[i])) {
      td.classList.add("face", `face-plane-${characters[i]}`)
    } else {
      console.warn("Title must be at least 3 characters long and include only upper case letters A-P: " + title);
    }
  }
}

function addStrutColumns(tr, title) {
  let b=0, r=0, y=0;
  if(title.length >= 3) {
    for(let i = 0; i < 3; i++) {
      let edge = title.substring(i, i+1);
      if("ABCD"   .includes(edge)) { b+=4 }
      if("EFGHIJK".includes(edge)) { b+=2 }
      if("L"      .includes(edge)) { r+=4 }
      if("EFGMN"  .includes(edge)) { r+=2 }
      if("OP"     .includes(edge)) { y+=4 }
      if("HIJKMN" .includes(edge)) { y+=2 }
    }
  } else {
    console.warn("Title must be at least 3 characters long: " + title);
  }
  // 3 edge color columns
  let td = tr.insertCell();
  td.className = "blu";
  if(b>0) {
    td.innerHTML = b;  
  }
  td = tr.insertCell();
  td.className = "red";
  if(r>0) {
    td.innerHTML = r;  
  }
  td = tr.insertCell();
  td.className = "yel";
  if(y>0) {
    td.innerHTML = y;  
  }
  const total = b + r + y;
  if(total != 12) {
    console.error(`Total struts for ${title} should be 12, not ${total}.`);
  }
}

function switchModel(url) {
  let scene = viewer.scene;
  // console.log({url, scene})
  viewer.src = url;
  setScene();
}

function setScene() {
  const scene = showEdges.checked ? "Edges" : "Faces";
  if(noScenes) {
    console.warn(`Using the default scene instead of '${scene}'.`)
  } else {
    // console.log({scene, camera})
    viewer.scene = scene;
  }
  viewer.update({ camera });
}
