//#region Constants
const DEV_MODE = true;          //--- When true and when running locally, dev mode will be active
const DEV_FOREVER_LOAD = true; //--- When true, loading screen will remain stuck forever

const REVEAL_BY_TIERS = false;  //--- True to reveal tiles in batches based on unlocked tiers (see TIERS variable below)
const FORCED_START = [];        //--- When defined, all new tiles will start on this position instead of the one configured in ORIGIN_POSITIONS
const TILE_DRAG_SNAP = false;    //--- Snap tiles to grid even when dragging the tile
const DEFAULT_ZOOM = 1;         //--- Default view box zoom

const CONFIRMATION_MOVE_DURATION = 1.5; //--- How long will camera take to focus on confirmed tile. Use 0 to disable the effect.
//#endregion

//#region Tiles
//--- Target positions of individual tiles. Imported from Google Sheets.
const TARGET_POSITIONS = new Map([
    ["tile10", [-2,1]],	["tile07", [-2,0]],		
    ["tile04", [-1,1]],	["tile05", [-1,0]],		
    ["tile03", [0,1]],	["tile01", [0,0]],	["tile11", [0,-1]],	["tile09", [0,-2]],
    ["tile12", [1,1]],	["tile02", [1,0]],	["tile06", [1,-1]],	["tile08", [1,-2]],
]);

//--- Starting positions of individual tiles. Imported from Google Sheets.
const ORIGIN_POSITIONS = new Map([								
    ["tile10", [-3,-2]],	["tile09", [-3,-3]],
    ["tile05", [-2,-2]],	["tile08", [-2,-3]],
        
["tile07", [0,3]],			["tile01", [0,0]],			
["tile03", [1,3]],						
["tile04", [2,3]],	["tile12", [2,2]],					
["tile06", [3,2]],	["tile02", [3,1]],	["tile11", [3,0]],													
]);

//--- Unlock tiers. Imported from Google Sheets.
const TIERS = [
    2,
    5,
    9,
    14,
    20,
    21,
]
//#endregion

//#region Elements
const ID_TILES_ELEMENT = "tiles";
const GAME_STATE_DEFAULT = "gameStateDefault";
const GAME_STATE_MOVE = "gameStateMove";
//#endregion

//#region Events
const EVENT_GAME_INIT = "GameInit";
const EVENT_GAME_DRAG_START = "GameDragStart";
const EVENT_GAME_DRAG = "GameDrag";
const EVENT_GAME_DRAG_END = "GameDragEnd";
const EVENT_TILE_CONFIRMED = "TileConfirmed";
const EVENT_PAUSE = "Pause";
//#endregion

//#region Variables
const VAR_GRID_X = "gX";
const VAR_GRID_Y = "gY";
const VAR_GRID_TARGET_X = "gtX";
const VAR_GRID_TARGET_Y = "gtY";
const VAR_TARGET_X = "tX";
const VAR_TARGET_Y = "tY";
const VAR_CONFIRMED = "tileConfirmed";
const VAR_TIER = "tileTier";
const VAR_TILE_MIN = "minTile";
const VAR_TILE_MAX = "maxTile";
//#endregion