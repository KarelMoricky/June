//#region Variables
const ID_OBJECT = "gameObject";
const ID_UI_OBJECT = "uiObject";
const ID_GAME = "game";
const ID_CURSOR = "cursor";
const ID_GRID = "grid";
const ID_CIRCLE = "circle";
const IDS_TILES = ["tile01", "tile02", "tile03", "tile04", "tile05", "tile06", "tile07", "tile08", "tile09", "tile10", "tile11", "tile12", "tile13", "tile14", "tile15", "tile16", "tile17", "tile18", "tile19", "tile20", "tile21"]
const ID_TILE_AREA = "tileArea";
const ID_INTRO = "intro";
const ID_TUTORIAL_VIEW = "tutorialView";
const ID_TUTORIAL_TILE = "tutorialTile";
const ID_LOADING = "loading";
const ID_LOADING_BACKGROUND = "loadingBackground";

const GRID_SIZE = 12;
const ISO_SIZE = 140;
const ISO_MATRIX = new DOMMatrixReadOnly()
    .rotate(30)
    .skewX(-30)
    .scale(1 * ISO_SIZE, 0.8602 * ISO_SIZE);

const VAR_GRID_X = "gX";
const VAR_GRID_Y = "gY";
const VAR_GRID_Z = "gZ";
const VAR_TARGET_X = "tX";
const VAR_TARGET_Y = "tY";
const VAR_TARGET_CONFIRMED = "conf";
const VAR_CONDITION = "cond";

const CLASS_TILE_SHOWN = "tile";
const CLASS_TILE_HIDDEN = "tileHidden";

const GAME_STATE_DEFAULT = "gameStateDefault";
const GAME_STATE_MOVE = "gameStateMove";

const TILE_STATE_EDITABLE = "tileStateEditable";
const TILE_STATE_EDITING = "tileStateEditing";
const TILE_STATE_CONFIRMED = "tileStateConfirmed";

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
var m_GameViewBox = [];
var m_SelectedTile = null;
var m_ConfirmedCount = 0;
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

        let gridX = parseInt(tile.getAttribute(VAR_GRID_X));
        let gridY = parseInt(tile.getAttribute(VAR_GRID_Y));
        SetTilePos(tile, gridX, gridY);
        EvaluateTile(tile, false);

        m_Tiles[i] = tile; //--- Must be called after SetTilePos(), otherwise the tile will think it's already occupied
    }
    RevealTiles();

    //uiSvg.addEventListener("click", OnClick);
    //m_Svg.addEventListener("mousemove", OnMouseMove);
    m_Svg.addEventListener("pointerdown", OnPointerDown);
    m_Svg.addEventListener("pointerup", OnPointerUp);

    if (m_IsDev)
        m_Svg.addEventListener("keydown", OnKeyDown);

    window.requestAnimationFrame(OnFrame);

    //--- Show tutorial
    let tutorialView = m_SvgDoc.getElementById(ID_TUTORIAL_VIEW);
    tutorialView.setAttribute("class", "");

    let tutorialTile = m_SvgDoc.getElementById(ID_TUTORIAL_TILE);
    tutorialTile.setAttribute("class", "");

    //--- Hide loading
    let loading = document.getElementById(ID_LOADING);
    loading.setAttribute("class", "hidden");

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
    // if (m_IsPaused)
    //     return;

    m_Click = true;
    m_ClickPos = [ev.clientX, ev.clientY];

    //--- Find tile to which clickable area belongs to
    m_SelectedTile = null;
    let element = m_SvgDoc.elementFromPoint(ev.clientX, ev.clientY);
    while (element)
    {
        if (element.getAttribute("class") == "tile" && !element.getAttribute(VAR_TARGET_CONFIRMED))
        {
            m_SelectedTile = element;
            break;
        }

        element = element.parentElement;
    }

    //--- Decide what is being dragged
    m_ClickTilePos = [];
    m_ClickViewBox = [];
    if (m_SelectedTile)
    {
        m_ClickTilePos = [parseInt(m_SelectedTile.getAttribute("x")), parseInt(m_SelectedTile.getAttribute("y"))];
        SetTileState(m_SelectedTile, TILE_STATE_EDITING);
    }
    else
    {
        m_ClickViewBox = GetViewBox(m_Game);
    }

    m_Svg.addEventListener("pointermove", OnPointerMove);
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
        var gridTransform = new DOMPointReadOnly(posX, posY).matrixTransform(ISO_MATRIX.inverse());
        gridTransform.x = Math.round(gridTransform.x);
        gridTransform.y = Math.round(gridTransform.y);

        SetTileTransform(m_SelectedTile, gridTransform);
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

        m_Svg.setAttribute("class", GAME_STATE_MOVE);
    }
}

function OnPointerUp(ev)
{
    m_Click = false;
    m_Svg.removeEventListener("pointermove", OnPointerMove);

    //--- Confirm tile
    if (m_SelectedTile)
        EvaluateTile(m_SelectedTile, true);
    else
        m_Svg.setAttribute("class", GAME_STATE_DEFAULT);

    m_SelectedTile = null;
}

function OnKeyDown(ev)
{
    if (ev.keyCode == 49)
    {
        //--- [1] Reveal all tiles
        m_ConfirmedCount = 1000;
        RevealTiles();
    }
    else if (ev.keyCode == 50)
    {
        //--- [2] Move all shown tiles to target coordinates
        let shownTiles = [];
        for (let i = 0; i < m_Tiles.length; i++)
        {
            if (m_Tiles[i].getAttribute("class") == CLASS_TILE_SHOWN)
            {
                shownTiles.push(m_Tiles[i]);
            }
        }
        for (let i = 0; i < shownTiles.length; i++)
        {
            if (shownTiles[i].getAttribute("class") == CLASS_TILE_SHOWN)
            {
                SetTilePos(shownTiles[i], shownTiles[i].getAttribute(VAR_TARGET_X), shownTiles[i].getAttribute(VAR_TARGET_Y));
                EvaluateTile(shownTiles[i], false);
            }
        }
    }
}
//#endregion

//#region Update
function OnFrame(time)
{
    // if (!m_IsPaused)
    // {
    //     m_GameTime += time - m_FrameTime;
    //     OnFrameGame(m_GameTime);
    // }

    // m_FrameTime = time;
    // window.requestAnimationFrame(OnFrame);
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
    //--- Check if some tile (including itself) already occupies the coordinates
    for (let i = 0; i < m_Tiles.length; i++)
    {
        if (m_Tiles[i].getAttribute("class") == CLASS_TILE_SHOWN && m_Tiles[i].getAttribute(VAR_GRID_X) == gridTransform.x && m_Tiles[i].getAttribute(VAR_GRID_Y) == gridTransform.y)
            return;
    }

    //--- Save grid position
    tile.setAttribute(VAR_GRID_X, gridTransform.x);
    tile.setAttribute(VAR_GRID_Y, gridTransform.y);
    tile.setAttribute(VAR_GRID_Z, gridTransform.x + gridTransform.y); //--- "Closeness" to camera, lower tiles are rendered above upper ones

    //--- Set screen position
    let gameTransform = gridTransform.matrixTransform(ISO_MATRIX);
    tile.setAttribute("x", gameTransform.x);
    tile.setAttribute("y", gameTransform.y);

    Log(tile.id, gridTransform.x, gridTransform.y);
    UpdateTiles();
}

function UpdateTiles()
{
    m_Tiles.sort((a, b) => parseInt(a.getAttribute(VAR_GRID_Z)) - parseInt(b.getAttribute(VAR_GRID_Z)));

    for (let i = 0; i < m_Tiles.length; i++)
    {
        m_Svg.appendChild(m_Tiles[i]);
    }
}

function RevealTiles()
{
    for (let i = 0; i < m_Tiles.length; i++)
    {
        if (m_Tiles[i].getAttribute(VAR_CONDITION) <= m_ConfirmedCount)
            m_Tiles[i].setAttribute("class", CLASS_TILE_SHOWN);
        else
            m_Tiles[i].setAttribute("class", CLASS_TILE_HIDDEN);
    }
}

function EvaluateTile(tile, isManual)
{
    if (tile.getAttribute(VAR_GRID_X) == tile.getAttribute(VAR_TARGET_X) && tile.getAttribute(VAR_GRID_Y) == tile.getAttribute(VAR_TARGET_Y))
    {
        tile.setAttribute(VAR_TARGET_CONFIRMED, true);
        SetTileState(tile, TILE_STATE_CONFIRMED);
        m_ConfirmedCount++;
        RevealTiles();

        if (isManual)
            PlayAudio("audioTest1");

        if (m_ConfirmedCount == 2)
        {
            //--- Hide tutorial
            let intro = m_SvgDoc.getElementById(ID_INTRO);
            intro.setAttribute("class", "hidden");

            let tutorialView = m_SvgDoc.getElementById(ID_TUTORIAL_VIEW);
            tutorialView.setAttribute("class", "hidden");
        
            let tutorialTile = m_SvgDoc.getElementById(ID_TUTORIAL_TILE);
            tutorialTile.setAttribute("class", "hidden");
        }
    }
    else
    {
        SetTileState(tile, TILE_STATE_EDITABLE);
    }
}

function SetTileState(tile, state)
{
    let tileArea = tile.getElementById(ID_TILE_AREA);
    tileArea.setAttribute("class", state);
}
//#endregion