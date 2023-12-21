//#region Variables
const ALLOW_DEV_MODE = true;

const ID_OBJECT = "gameObject";
const ID_LOG = "log";
const ID_VIEWPORT = "viewPort";
const ID_CURSOR = "cursor";
const ID_GRID = "grid";
const ID_CIRCLE = "circle";
const ID_PAUSE = "pause";
const IDS_TILES = [
    "tile1",
    "tile2"
]
const ID_TILE_AREA = "tileArea";
const SOUND_FILES = [
    /*0*/"./sounds/test.wav",
    /*1*/"./sounds/test2.wav"
];

const GRID_SIZE = 12;
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

var m_SvgDoc;
var m_Svg;
var m_Log;
var m_ViewPort;
var m_Pause;
var m_Circle;
var m_Cursor;
var m_Tiles = [];
var m_Grid;

var m_FrameTime = 0;
var m_GameTime = 0;
var m_Click = false;
var m_ClickPos = [];
var m_ClickViewBox = [];
var m_ClickTilePos = [];
var m_IsPaused = false;
var m_IsDev = false;
var m_Sounds = [];
var m_ViewPortDimensions = [];
var m_SelectedTile = null;
//#endregion

//#region Init
window.addEventListener("load", OnLoad);
function OnLoad()
{
    m_IsDev = ALLOW_DEV_MODE && window.location.href.startsWith("http://127.0.0.1");

    m_Log = document.getElementById(ID_LOG);

    let object = document.getElementById(ID_OBJECT);
    m_SvgDoc = object.contentDocument;
    if (!m_SvgDoc)
	{
		//--- Failed to load, show just the map
		alert("Error when loading SVG!");
		return;
    }

    m_Svg = m_SvgDoc.firstElementChild;
    m_Pause = m_SvgDoc.getElementById(ID_PAUSE);
    m_ViewPort = m_SvgDoc.getElementById(ID_VIEWPORT);
    m_Circle = m_SvgDoc.getElementById(ID_CIRCLE);
    m_Cursor = m_SvgDoc.getElementById(ID_CURSOR);

    //--- Get viewport dimensions
    m_ViewPortDimensions = GetViewBox(m_ViewPort);
    
    const minTransform = new DOMPointReadOnly(m_ViewPortDimensions[0], m_ViewPortDimensions[1]).matrixTransform(m_ViewPort.getScreenCTM());
    const maxTransform = new DOMPointReadOnly(-m_ViewPortDimensions[0], -m_ViewPortDimensions[1]).matrixTransform(m_ViewPort.getScreenCTM());

    for (let i = 0; i < IDS_TILES.length; i++)
    {
        m_Tiles[i] = m_SvgDoc.getElementById(IDS_TILES[i]);

        let tileArea = m_Tiles[i].getElementById(ID_TILE_AREA);
        tileArea.addEventListener("mouseenter", OnTileMouseEnter);
        tileArea.addEventListener("mouseleave", OnTileMouseLeave);
    }

    m_Svg.addEventListener("click", OnClick);
    m_Svg.addEventListener("mousemove", OnMouseMove);
    //m_Svg.addEventListener("dblclick", OnDblClick);
    m_Svg.addEventListener("pointerdown", OnPointerDown);
    m_Svg.addEventListener("pointerup", OnPointerUp);

    window.requestAnimationFrame(OnFrame);

    document.addEventListener("fullscreenchange", OnFullScreenChange);
    OnFullScreenChange();

    //--- Load sounds
    for (let i = 0; i < SOUND_FILES.length; i++)
    {
        m_Sounds[i] = new Audio(SOUND_FILES[i]);
    }

    //--- Init grid
    let grid = m_SvgDoc.getElementById(ID_GRID);
    CreateElement("circle", m_ViewPort, [["r", 0.1], ["fill", "blue"]]);
    for (let x = -GRID_SIZE / 2; x <= GRID_SIZE / 2; x++)
    {
        for (let y = -GRID_SIZE / 2; y <= GRID_SIZE / 2; y++)
        {
            CreateElement("circle", grid, [["cx", x], ["cy", y], ["r", 0.1], ["fill", "grey"]]);
        }
    }

    if (m_IsDev)
        document.title = "[DEV] " + document.title;
}

//#endregion

//#region Events
function OnFullScreenChange()
{
    m_IsPaused = !m_IsDev && !IsFullScreen();
    if (m_IsPaused)
    {
        m_Pause.setAttribute("visibility", "visible");
    }
    else
    {
        m_Pause.setAttribute("visibility", "hidden");
    }
}

function OnClick()
{
    if (m_IsPaused)
    {
        ToggleFullscreen();
        return;
    }

    //m_Circle.setAttribute("style", "fill: rgb(128,0,128);");
    //PlaySound(0);
    //PlaySound(1);
}
/*
function OnDblClick()
{
    ToggleFullscreen();
}
*/
function OnMouseMove(ev)
{
    const transform = new DOMPointReadOnly(ev.clientX, ev.clientY).matrixTransform(m_ViewPort.getScreenCTM().inverse());
    if (m_Cursor)
    {
        m_Cursor.setAttribute("cx", transform.x);
        m_Cursor.setAttribute("cy", transform.y);
    }
}

function OnPointerDown(ev)
{
    if (m_IsPaused)
        return;

    m_Click = true;
    m_ClickPos = [ev.offsetX, ev.offsetY];

    m_ClickTilePos = [];
    m_ClickViewBox = [];
    if (m_SelectedTile)
    {
        console.log(m_SelectedTile);
        console.log(m_SelectedTile.getAttribute("x"));
        m_ClickTilePos = [parseInt(m_SelectedTile.getAttribute("x")), parseInt(m_SelectedTile.getAttribute("y"))];
    }
    else
        m_ClickViewBox = GetViewBox(m_ViewPort);

    m_Svg.addEventListener("pointermove", OnPointerMove);
}

function OnPointerUp(ev)
{
    m_Click = false;
    m_Svg.removeEventListener("pointermove", OnPointerMove);
}

function OnPointerMove(ev)
{
    let offset = [-ev.offsetX + m_ClickPos[0], -ev.offsetY + m_ClickPos[1]];

    //--- #TODO: Limit by edge, not center
    //const minTransform = new DOMPointReadOnly(m_ViewPortDimensions[0], m_ViewPortDimensions[1]).matrixTransform(m_ViewPort.getScreenCTM());
    //const maxTransform = new DOMPointReadOnly(-m_ViewPortDimensions[0], -m_ViewPortDimensions[1]).matrixTransform(m_ViewPort.getScreenCTM());

    if (m_ClickTilePos.length != 0)
    {
        //--- Drag tile
        m_SelectedTile.setAttribute("x", m_ClickTilePos[0] - offset[0]);
        m_SelectedTile.setAttribute("y", m_ClickTilePos[1] - offset[1]);
    }
    
    if (m_ClickViewBox.length != 0)
    {
        //--- Drag view
        let viewBox = [
            Clamp(m_ClickViewBox[0] + offset[0], -m_ViewPortDimensions[2], 0),
            Clamp(m_ClickViewBox[1] + offset[1], -m_ViewPortDimensions[3], 0),
            m_ClickViewBox[2],
            m_ClickViewBox[3]
        ];
        SetViewBox(m_ViewPort, viewBox);
    }
}

function OnTileMouseEnter(ev)
{
    m_SelectedTile = ev.toElement.parentElement;
    console.debug("OnTileMouseEnter: " + ev.fromElement.id + " > " + ev.toElement.id);
}

function OnTileMouseLeave(ev)
{
    m_SelectedTile = null;
    console.debug("OnTileMouseLeave: " + ev.fromElement.id + " > " + ev.toElement.id);
}
//#endregion

//#region Update
function OnFrame(time)
{
    if (!m_IsPaused)
    {
        m_GameTime += time - m_FrameTime;
        OnFrameGame(m_GameTime);
    }

    m_FrameTime = time;
    window.requestAnimationFrame(OnFrame);
}
function OnFrameGame()
{
    //let radius = 10 * InvLerp(-1, 1, Math.sin(m_GameTime * 0.007));
    //m_Circle.setAttribute("r", radius + "%");
}
//#endregion

//#region Misc
function CreateElement(type, parent, params = [])
{
    let element = document.createElementNS("http://www.w3.org/2000/svg", type);
    parent.appendChild(element);
    for (let i = 0; i < params.length; i++)
    {
        element.setAttribute(params[i][0], params[i][1]);
    }
    return element;
}

function GetViewBox(element)
{
    let viewPortDimensionsStr = element.getAttribute("viewBox").split(" ");
    let viewPortDimensions = [];
    for (let i = 0; i < viewPortDimensionsStr.length; i++)
    {
        viewPortDimensions[i] = parseInt(viewPortDimensionsStr[i]);
    }
    return viewPortDimensions;
}

function SetViewBox(element, viewBox)
{
    element.setAttribute("viewBox", viewBox[0] + " " + viewBox[1] + " " + viewBox[2] + " " + viewBox[3]);
}
//#endregion

//#region Math
function Lerp(a, b, t)
{
	return a * (1 - t) + (b * t);
}
function InvLerp(a, b, v)
{
	return Math.min(Math.max((v - a) / (b - a), 0), 1);
}
function SmoothStep(x)
{
	return x * x * (3 - 2 * x);
}
function Clamp(value, min, max)
{
    return Math.max(min, Math.min(max, value));
}
//#endregion

//#region Full-screen
//--- https://stackoverflow.com/questions/36672561/how-to-exit-fullscreen-onclick-using-javascript
function ToggleFullscreen() {
    if (!IsFullScreen())
    {
        let docElm = document.documentElement;
        if (docElm.requestFullscreen)
            docElm.requestFullscreen();
        else if (docElm.mozRequestFullScreen)
            docElm.mozRequestFullScreen();
        else if (docElm.webkitRequestFullScreen)
            docElm.webkitRequestFullScreen();
        else if (docElm.msRequestFullscreen)
            docElm.msRequestFullscreen();
    }
    else
    {
        if (document.exitFullscreen)
            document.exitFullscreen();
        else if (document.webkitExitFullscreen)
            document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen)
            document.mozCancelFullScreen();
        else if (document.msExitFullscreen)
            document.msExitFullscreen();
    }
}
function IsFullScreen()
{
    return (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);
}

//#endregion

//#region Audio

function PlaySound(index)
{
    if (index < 0 || index >= m_SoundFiles.length)
    {
        alert("Cannot play sound, index=" + index + " is out of bounds!");
        return;
    }

    let sound = m_Sounds[index];
    sound.load();
    sound.play();
}

function PlayAudio(name)
{
    //--- https://www.w3schools.com/JSREF/dom_obj_audio.asp
    let audioObject = document.getElementById(name);
    audioObject.load();
    audioObject.play();
}

//#endregion

//#region Localization

// https://stackoverflow.com/questions/1293147/how-to-parse-csv-data
function ParseCSV(str)
{
    const arr = [];
    let quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (let row = 0, col = 0, c = 0; c < str.length; c++)
    {
        let cc = str[c], nc = str[c+1];        // Current character, next character
        arr[row] = arr[row] || [];             // Create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    return arr;
}

    // https://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
	// This will parse a delimited string into an array of
	// arrays. The default delimiter is the comma, but this
	// can be overriden in the second argument.
	function CSVToArray( strData, strDelimiter ){
		// Check to see if the delimiter is defined. If not,
		// then default to comma.
		strDelimiter = (strDelimiter || ",");

		// Create a regular expression to parse the CSV values.
		var objPattern = new RegExp(
			(
				// Delimiters.
				"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

				// Quoted fields.
				"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

				// Standard fields.
				"([^\"\\" + strDelimiter + "\\r\\n]*))"
			),
			"gi"
			);


		// Create an array to hold our data. Give the array
		// a default empty first row.
		var arrData = [[]];

		// Create an array to hold our individual pattern
		// matching groups.
		var arrMatches = null;


		// Keep looping over the regular expression matches
		// until we can no longer find a match.
		while (arrMatches = objPattern.exec( strData )){

			// Get the delimiter that was found.
			var strMatchedDelimiter = arrMatches[ 1 ];

			// Check to see if the given delimiter has a length
			// (is not the start of string) and if it matches
			// field delimiter. If id does not, then we know
			// that this delimiter is a row delimiter.
			if (
				strMatchedDelimiter.length &&
				(strMatchedDelimiter != strDelimiter)
				){

				// Since we have reached a new row of data,
				// add an empty row to our data array.
				arrData.push( [] );

			}


			// Now that we have our delimiter out of the way,
			// let's check to see which kind of value we
			// captured (quoted or unquoted).
			if (arrMatches[ 2 ]){

				// We found a quoted value. When we capture
				// this value, unescape any double quotes.
				var strMatchedValue = arrMatches[ 2 ].replace(
					new RegExp( "\"\"", "g" ),
					"\""
					);

			} else {

				// We found a non-quoted value.
				var strMatchedValue = arrMatches[ 3 ];

			}


			// Now that we have our value string, let's add
			// it to the data array.
			arrData[ arrData.length - 1 ].push( strMatchedValue );
		}

		// Return the parsed data.
		return( arrData );
	}

//#endregion
