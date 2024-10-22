//#region Constants
const DEV_MODE = 1;             //--- 0: disabled, 1: offline, 2: offline & online
const DEV_SKIP_INTRO = 1;       //--- When true, intro screen will be skipped. Offline mode only.
const DEV_MANUAL_LOAD = 1;      //--- When true, loading screen has to be progressed manually by clicking on play button. Dev mode only.

const FORCED_START = [];        //--- When defined, all new tiles will start on this position instead of the one configured in ORIGIN_POSITIONS
const TILE_DRAG_SNAP = 2;       //--- 0: No snap, 1: Always snap, 2: Snap only adjacent
const DEFAULT_ZOOM = 1;         //--- Default view box zoom
const NOTE_LOADING = 0;         //--- Force note loading

const SKIP_NOTE_ANIM = 0;       //--- When true, note reveal animation will be instant
const SKIP_OUTRO_ANIM = 0;      //--- When true, initial otro animation (zoom out) will be instant

const DEFAULT_LANGUAGE = "en";  //--- Default localization language
//#endregion

//#region Tiles
//--- Target positions of individual tiles. Imported from Google Sheets.
const TARGET_POSITIONS = new Map([
    ["tile09", [-2,1]],	["tile07", [-2,0]],		
    ["tile06", [-1,1]],	["tile05", [-1,0]],		
    ["tile03", [0,1]],	["tile02", [0,0]],	["tile10", [0,-1]],	["tile11", [0,-2]],
    ["tile12", [1,1]],	["tile01", [1,0]],	["tile04", [1,-1]],	["tile08", [1,-2]],
]);

//--- Starting positions of individual tiles. Imported from Google Sheets.
const ORIGIN_POSITIONS = new Map([	
    ["tile01", [1,0]],
    ["tile02", [-2,-2]],
    ["tile03", [2,3]],
    ["tile04", [3,2]],
    ["tile05", [-2,-3]],
    ["tile06", [-4,-2]],
    ["tile07", [2,3]],
    ["tile08", [3,1]],
    ["tile09", [-2,-2]],
    ["tile10", [3,1]],
    ["tile11", [3,0]],
    ["tile12", [3,3]],
]);

const ISO_SIZE = 140;
const ISO_MATRIX = new DOMMatrixReadOnly()
    //--- Art-mandated grid
    // .rotate(26.565)
    // .skewX(-36.87)
    // .scale(ISO_SIZE, ISO_SIZE * 0.8);
    //--- Pure isometric grid
    .rotate(30)
    .skewX(-30)
    .scale(1 * ISO_SIZE, 0.8602 * ISO_SIZE);
//#endregion

//#region Elements
const ID_TILES_ELEMENT = "tileComposition";
const GAME_STATE_DEFAULT = "gameStateDefault";
const GAME_STATE_MOVE = "gameStateMove";
const GAME_STATE_DISABLED = "gameStateDisabled";
//#endregion

//#region Events
const EVENT_GAME_INIT = "GameInit";
const EVENT_GAME_START = "GameStart";
const EVENT_GAME_DRAG_START = "GameDragStart";
const EVENT_GAME_DRAG = "GameDrag";
const EVENT_GAME_DRAG_END = "GameDragEnd";
const EVENT_TILE_CONFIRMED = "TileConfirmed";
const EVENT_INTRO = "Intro";
const EVENT_OUTRO = "Outro";
//#endregion

//#region Variables
const VAR_GRID_X = "gX";
const VAR_GRID_Y = "gY";
const VAR_GRID_TARGET_X = "gtX";
const VAR_GRID_TARGET_Y = "gtY";
const VAR_TARGET_X = "tX";
const VAR_TARGET_Y = "tY";
const VAR_CONFIRMED = "tileConfirmed";
const VAR_TILE_MIN = "minTile";
const VAR_TILE_MAX = "maxTile";
//#endregion

//#region Vibrations
const VIBRATION_PLAY = [150, 50,20];

const VIBRATION_TILE_DRAG_START = [10];
const VIBRATION_TILE_DRAG_END = [10];
const VIBRATION_TILE_CONFIRMED = [100, 50,50, 50,30, 50,10];

const VIBRATION_OUTRO_DRAG_START = [10];
const VIBRATION_OUTRO_DRAG_END = [10];
const VIBRATION_OUTRO_CONFIRMED = [10,100, 50,200, 50,200, 50];
const VIBRATION_OUTRO_LETTER = [20];
//#endregion