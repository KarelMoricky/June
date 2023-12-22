//#region Variables
const ID_OBJECT = "gameObject";
const ID_UI_OBJECT = "uiObject";
const ID_GAME = "game";
const ID_CURSOR = "cursor";
const ID_GRID = "grid";
const ID_CIRCLE = "circle";
const IDS_TILES = [
    "tile1",
    "tile2",
    "tile3"
]
const ID_TILE_AREA = "tileArea";
const SOUND_FILES = [
    /*0*/"./sounds/test.wav",
    /*1*/"./sounds/test2.wav"
];

const GRID_SIZE = 12;

var m_SvgDoc;
var m_UiSvgDoc;
var m_Svg;
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
var m_Sounds = [];
var m_GameViewBox = [];
var m_SelectedTile = null;
let m_IsoMatrix = new DOMMatrixReadOnly()
    .rotate(30)
    .skewX(-30)
    .scale(1 * 200, 0.8602 * 200);
//#endregion

//#region Init
window.addEventListener("load", OnLoad);
function OnLoad()
{
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
    m_GameViewBox = GetViewBox(m_Game);

    for (let i = 0; i < IDS_TILES.length; i++)
    {
        let tile = m_SvgDoc.getElementById(IDS_TILES[i])
        let gridX = parseInt(tile.getAttribute("gridX"));
        let gridY = parseInt(tile.getAttribute("gridY"));
        SetTilePos(tile, gridX, gridY);

        m_Tiles[i] = tile;
        //let tileArea = m_Tiles[i].getElementById(ID_TILE_AREA);
        //tileArea.addEventListener("mouseenter", OnTileMouseEnter);
        //tileArea.addEventListener("mouseleave", OnTileMouseLeave);
    }

    //uiSvg.addEventListener("click", OnClick);
    //m_Svg.addEventListener("mousemove", OnMouseMove);
    m_Svg.addEventListener("pointerdown", OnPointerDown);
    m_Svg.addEventListener("pointerup", OnPointerUp);

    window.requestAnimationFrame(OnFrame);

    //--- Load sounds
    for (let i = 0; i < SOUND_FILES.length; i++)
    {
        m_Sounds[i] = new Audio(SOUND_FILES[i]);
    }

    //--- Init grid
    // m_Grid = m_SvgDoc.getElementById(ID_GRID);
    // m_GridDebug = m_SvgDoc.getElementById("gridDebug");
    // CreateElement("circle", m_Game, [["r", 0.1], ["fill", "blue"]]);
    // for (let x = -GRID_SIZE / 2; x <= GRID_SIZE / 2; x++)
    // {
    //     for (let y = -GRID_SIZE / 2; y <= GRID_SIZE / 2; y++)
    //     {
    //         CreateElement("circle", m_Grid, [["cx", x], ["cy", y], ["r", 0.01], ["fill", "black"]]);
    //     }
    // }
}

//#endregion

//#region Events
function OnMouseMove(ev)
{
    /*
    const transform = new DOMPointReadOnly(ev.clientX, ev.clientY).matrixTransform(m_Game.getScreenCTM().inverse());
    if (m_Cursor)
    {
        m_Cursor.setAttribute("cx", transform.x);
        m_Cursor.setAttribute("cy", transform.y);
    }
    */
}

function OnPointerDown(ev)
{
    if (m_IsPaused)
        return;

    m_Click = true;
    m_ClickPos = [ev.clientX, ev.clientY];

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
        let coef = Math.min((m_GameViewBox[2] / window.innerWidth), (m_GameViewBox[3] / window.innerHeight)); //--- I have no idea what I'm doing
        let posX = m_ClickTilePos[0] - (m_ClickPos[0] - ev.clientX) * coef;
        let posY = m_ClickTilePos[1] - (m_ClickPos[1] - ev.clientY) * coef;

        //--- Snap to grid
        var gridTransform = new DOMPointReadOnly(posX, posY).matrixTransform(m_IsoMatrix.inverse());
        gridTransform.x = Math.round(gridTransform.x);
        gridTransform.y = Math.round(gridTransform.y);

        SetTileTransform(m_SelectedTile, gridTransform);
        UpdateTiles();
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
/*
function OnTileMouseEnter(ev)
{
    console.debug("OnTileMouseEnter: " + ev.fromElement.id + " > " + ev.toElement.id);
}

function OnTileMouseLeave(ev)
{
    console.debug("OnTileMouseLeave: " + ev.fromElement.id + " > " + ev.toElement.id);
}
*/
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

//#region Tiles
function SetTilePos(tile, gridX, gridY)
{
    SetTileTransform(tile, new DOMPointReadOnly(gridX, gridY));
}

function SetTileTransform(tile, gridTransform)
{
    tile.setAttribute("gridX", gridTransform.x);
    tile.setAttribute("gridY", gridTransform.y);
    tile.setAttribute("gridZ", gridTransform.x + gridTransform.y); //--- "Closeness" to camera, lower tiles are rendered above upper ones

    let gameTransform = gridTransform.matrixTransform(m_IsoMatrix);
    tile.setAttribute("x", gameTransform.x);
    tile.setAttribute("y", gameTransform.y);

    Log(tile.id, gridTransform.x, gridTransform.y);
}

function UpdateTiles()
{
    m_Tiles.sort((a, b) => parseInt(a.getAttribute("gridZ")) - parseInt(b.getAttribute("gridZ")));

    for (let i = 0; i < m_Tiles.length; i++)
    {
        m_Svg.appendChild(m_Tiles[i]);
    }
}
//#endregion