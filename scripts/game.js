//#region Variables
const ALLOW_DEV_MODE = true;

const ID_OBJECT = "gameObject";
const ID_UI_OBJECT = "uiObject";
const ID_GAME = "game";
const ID_LOG = "log";
const ID_CURSOR = "cursor";
const ID_GRID = "grid";
const ID_CIRCLE = "circle";
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
var m_UiSvgDoc;
var m_Svg;
var m_Log;
var m_Circle;
var m_Cursor;
var m_Tiles = [];
var m_Grid;
var m_GridDebug;

var m_FrameTime = 0;
var m_GameTime = 0;
var m_Click = false;
var m_ClickPos = [];
var m_ClickViewBox = [];
var m_ClickTilePos = [];
var m_IsDev = false;
var m_Sounds = [];
var m_GameDimensions = [];
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
		alert("Error when loading Game SVG!");
		return;
    }

    m_Svg = m_SvgDoc.firstElementChild;
    m_Game = m_SvgDoc.getElementById(ID_GAME);
    m_Circle = m_SvgDoc.getElementById(ID_CIRCLE);
    m_Cursor = m_SvgDoc.getElementById(ID_CURSOR);

    //--- Get game dimensions
    m_GameDimensions = GetViewBox(m_Game);

    for (let i = 0; i < IDS_TILES.length; i++)
    {
        m_Tiles[i] = m_SvgDoc.getElementById(IDS_TILES[i]);

        //let tileArea = m_Tiles[i].getElementById(ID_TILE_AREA);
        //tileArea.addEventListener("mouseenter", OnTileMouseEnter);
        //tileArea.addEventListener("mouseleave", OnTileMouseLeave);
    }

    //uiSvg.addEventListener("click", OnClick);
    m_Svg.addEventListener("mousemove", OnMouseMove);
    //m_Svg.addEventListener("dblclick", OnDblClick);
    m_Svg.addEventListener("pointerdown", OnPointerDown);
    m_Svg.addEventListener("pointerup", OnPointerUp);

    window.requestAnimationFrame(OnFrame);

    //--- Load sounds
    for (let i = 0; i < SOUND_FILES.length; i++)
    {
        m_Sounds[i] = new Audio(SOUND_FILES[i]);
    }

    //--- Init grid
    m_Grid = m_SvgDoc.getElementById(ID_GRID);
    m_GridDebug = m_SvgDoc.getElementById("gridDebug");
    CreateElement("circle", m_Game, [["r", 0.1], ["fill", "blue"]]);
    for (let x = -GRID_SIZE / 2; x <= GRID_SIZE / 2; x++)
    {
        for (let y = -GRID_SIZE / 2; y <= GRID_SIZE / 2; y++)
        {
            CreateElement("circle", m_Grid, [["cx", x], ["cy", y], ["r", 0.1], ["fill", "rgb(230,230,230)"]]);
        }
    }

    if (m_IsDev)
        document.title = "[DEV] " + document.title;
}

//#endregion

//#region Events
/*
function OnDblClick()
{
    ToggleFullscreen();
}
*/
function OnMouseMove(ev)
{
    const transform = new DOMPointReadOnly(ev.clientX, ev.clientY).matrixTransform(m_Game.getScreenCTM().inverse());
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
    m_ClickPos = [ev.clientX, ev.clientY];

    //--- Debug circles
    m_Circle.setAttribute("cx", m_ClickPos[0]);
    m_Circle.setAttribute("cy", m_ClickPos[1]);

    m_ClickTilePos = [];
    m_ClickViewBox = [];

    m_SelectedTile = m_SvgDoc.elementFromPoint(ev.clientX, ev.clientY).parentElement;
    if (m_SelectedTile)
    {
        m_ClickTilePos = [parseInt(m_SelectedTile.getAttribute("x")), parseInt(m_SelectedTile.getAttribute("y"))];
    }
    else
    {
        m_ClickViewBox = GetViewBox(m_Game);
    }

    m_Svg.addEventListener("pointermove", OnPointerMove);
}

function OnPointerUp(ev)
{
    m_Click = false;
    m_Svg.removeEventListener("pointermove", OnPointerMove);
}

function OnPointerMove(ev)
{
    if (m_ClickTilePos.length != 0)
    {
        //--- Drag tile
        let coef = Math.min((m_GameDimensions[2] / window.innerWidth), (m_GameDimensions[3] / window.innerHeight)); //--- I have no idea what I'm doing
        let posX = m_ClickTilePos[0] - (m_ClickPos[0] - ev.clientX) * coef;
        let posY = m_ClickTilePos[1] - (m_ClickPos[1] - ev.clientY) * coef;

        //--- #TODO: Use tile center position
        var gridTransform = new DOMPointReadOnly(ev.clientX, ev.clientY).matrixTransform(m_Grid.getScreenCTM().inverse());
        gridTransform.x = Math.round(gridTransform.x);
        gridTransform.y = Math.round(gridTransform.y);

        m_GridDebug.setAttribute("cx", gridTransform.x);
        m_GridDebug.setAttribute("cy", gridTransform.y);

        gridTransform = gridTransform.matrixTransform(m_Grid.getScreenCTM());
    
        m_SelectedTile.setAttribute("x", m_ClickTilePos[0] - (m_ClickPos[0] - gridTransform.x) * coef);
        m_SelectedTile.setAttribute("y", m_ClickTilePos[1] - (m_ClickPos[1] - gridTransform.y) * coef);

        m_Log.innerHTML = gridTransform.x + "," + gridTransform.y;
    }
    else if (m_ClickViewBox.length != 0)
    {
        //--- Drag view
        let coef = Math.min((m_ClickViewBox[2] / window.innerWidth), (m_ClickViewBox[3] / window.innerHeight)); //--- I have no idea what I'm doing
        let viewBox = [
            m_ClickViewBox[0] + (m_ClickPos[0] - ev.clientX) * coef,
            m_ClickViewBox[1] + (m_ClickPos[1] - ev.clientY) * coef,
            m_ClickViewBox[2],
            m_ClickViewBox[3]
        ];
        SetViewBox(m_Game, viewBox);
    }
}

function OnTileMouseEnter(ev)
{
    console.debug("OnTileMouseEnter: " + ev.fromElement.id + " > " + ev.toElement.id);
}

function OnTileMouseLeave(ev)
{
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
    let viewBoxStr = element.getAttribute("viewBox").split(" ");
    let viewBox = [];
    for (let i = 0; i < viewBoxStr.length; i++)
    {
        viewBox[i] = parseInt(viewBoxStr[i]);
    }
    return viewBox;
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
