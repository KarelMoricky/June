var Tile = new function()
{
    const INERTIA_DEFAULT = 0.02;

    const ID_TILE_AREA = "tileArea";
    const ID_TILE_CONTENT = "tileContent";
    const ID_TILE_TARGET = "tileHint";
    
    const CLASS_TILE_CURRENT = "tileCurrent";
    const CLASS_TILE_CONFIRMED = "tileConfirmed";
    
    const TILE_STATE_EDITABLE = "tileStateEditable";
    const TILE_STATE_EDITING = "tileStateEditing";
    const TILE_STATE_CONFIRMED = "tileStateConfirmed";

    //--- Grid
    const GRID_SIZE = 12;
    const ISO_SIZE = 140;
    const ISO_MATRIX = new DOMMatrixReadOnly()
        .rotate(30)
        .skewX(-30)
        .scale(1 * ISO_SIZE, 0.8602 * ISO_SIZE);

    var m_CurrentTile = null;
    var m_SelectedTile = null;
    var m_Tiles = [];
    var m_TilesZSorted = [];
    var m_ClickTilePos = [];
    var m_ConfirmedCount = 0;
    //var m_Tier = 0;
    var m_TargetPos = [];
    var m_TimePrev = 0;
    var m_TilesElement = null;
    var m_TileHint = null;
    // var m_Grid;
    // var m_GridDebug;

    this.GetSelected = function()
    {
        return m_SelectedTile;
    }

    this.SetSelected = function(ev)
    {
        m_SelectedTile = null;
        let element = Game.GetSVGDoc().elementFromPoint(ev.clientX, ev.clientY);
        while (element)
        {
            if (element.classList.contains("tile") && !element.getAttribute(VAR_CONFIRMED))
            {
                m_SelectedTile = element;
                break;
            }
    
            element = element.parentElement;
        }
    }

    this.RevealNextTile = function()
    {
        RevealNextTile();
    }
    
    window.addEventListener(EVENT_GAME_INIT, OnGameInit);
    window.addEventListener(EVENT_GAME_DRAG_START, OnGameDragStart);
    window.addEventListener(EVENT_GAME_DRAG, OnGameDrag);
    window.addEventListener(EVENT_GAME_DRAG_END, OnGameDragEnd);

    function OnGameInit()
    {
        m_TilesElement = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
        m_TileHint = Game.GetSVGDoc().getElementById(ID_TILE_TARGET);

        let i = 0;
        for (let tileID of TARGET_POSITIONS.keys())
        {
            let tile = Game.GetSVGDoc().getElementById(tileID);
    
            //--- Get target position
            let targetPosition = TARGET_POSITIONS.get(tileID);
            tile.setAttribute(VAR_GRID_TARGET_X, targetPosition[0]);
            tile.setAttribute(VAR_GRID_TARGET_Y, targetPosition[1]);
    
            //--- Get origin position
            let originPosition = ORIGIN_POSITIONS.get(tileID);
            if (!originPosition)
            {
                alert("Origin position for \"" + tileID + "\" not defined in ORIGIN_POSITIONS!");
                continue;
            }
            let gridX = originPosition[0];
            let gridY = originPosition[1];
    
            if (FORCED_START.length == 2 && !tile.getAttribute(VAR_CONFIRMED))
            {
                gridX = FORCED_START[0];
                gridY = FORCED_START[1];
            }

            if (tile.getAttribute(VAR_CONFIRMED))
                SetElementVisible(tile, true);

            SetTilePos(tile, gridX, gridY);
            EvaluateTile(tile, false);

            if (tile.id == "tile02") //--- #TODO: Don't hardcode
                SetCurrentTile(tile);
    
            m_Tiles[i] = tile; //--- Must be called after SetTilePos(), otherwise the tile will think it's already occupied
            m_TilesZSorted[i] = tile;
            i++;
        }
        m_Tiles.sort((a, b) => parseInt(a.getAttribute("tileId")) - parseInt(b.getAttribute("tileId")));

        //--- Cheats
        Game.GetSVG().addEventListener("keydown", OnKeyDown);
        Game.GetSVG().getElementById("cheatRevealAll").addEventListener("click", CheatRevealAll);

        requestAnimationFrame(OnEachFrame);

        //RevealNextTile();
    }

    function OnKeyDown(ev)
    {
        //--- Cheat combination
        if (!ev.ctrlKey || !ev.shiftKey)
            return;

        if (ev.key == " ")
        {
            //--- [Space] Auto-place next tile
            for (let i = 0; i < m_Tiles.length; i++)
            {
                if (m_Tiles[i].getAttribute(VAR_CONFIRMED) == null)
                {
                    SetTilePos(m_Tiles[i], m_Tiles[i].getAttribute(VAR_GRID_TARGET_X), m_Tiles[i].getAttribute(VAR_GRID_TARGET_Y));
                    EvaluateTile(m_Tiles[i], true);
                    break;
                }
            }
        }
        else if (ev.key == "~")
        {
            //--- [~] Skip to the last tile
            CheatRevealAll();
        }
        else if (ev.key == "X")
        {
            //--- [X] Toggle numbers
            SetStyleVariable("--display-numbers", "block");
        }
    }

    function OnEachFrame()
    {
        let timeNow = Date.now();
        let timeSlice = (timeNow - m_TimePrev) * INERTIA_DEFAULT;
        m_TimePrev = timeNow;

        if (m_CurrentTile && m_TargetPos.length > 0 && m_CurrentTile.getAttribute("x") != null)
        {
            let posX = Lerp(m_CurrentTile.getAttribute("x"), m_TargetPos[0], timeSlice);
            let posY = Lerp(m_CurrentTile.getAttribute("y"), m_TargetPos[1], timeSlice);

            m_CurrentTile.setAttribute("x", posX);
            m_CurrentTile.setAttribute("y", posY);
         }
         
         requestAnimationFrame(OnEachFrame);
    }

    function OnGameDragStart(ev)
    {
        if (!m_SelectedTile)
            return;

        m_TargetPos = [];

        m_ClickTilePos = [parseInt(m_SelectedTile.getAttribute("x")), parseInt(m_SelectedTile.getAttribute("y"))];
        SetTileState(m_SelectedTile, TILE_STATE_EDITING);

        m_SelectedTile.querySelector("#tileContent").classList.remove("tileFadeIn");

        Vibrate(VIBRATION_TILE_DRAG_START);
    }

    function OnGameDrag(ev)
    {
        if (!m_SelectedTile)
            return;

        DragTile(ev, TILE_DRAG_SNAP);
            
        //--- Dragged tile always on top (can't be in OnGameDragStart, it prevents Drand and DragEnd events from firing in Android Firefox)
        if (!TILE_DRAG_SNAP)
            m_TilesElement.appendChild(m_SelectedTile);
    }

    function OnGameDragEnd(ev)
    {
        if (!m_SelectedTile)
            return;

        DragTile(ev, true);
        let tile = m_SelectedTile;
        m_SelectedTile = null;
        
        let isConfirmed = EvaluateTile(tile, true);
        UpdateTiles();

        if (isConfirmed)
        {
            AnimateTile(tile, true);
            Vibrate(VIBRATION_TILE_CONFIRMED);
        }
        else
        {
            Vibrate(VIBRATION_TILE_DRAG_END);
        }
    }

    function DragTile(ev, snap)
    {
        let viewBox = Game.GetCurrentViewBox();
        let coef = Math.min((viewBox[2] / window.innerWidth), (viewBox[3] / window.innerHeight)); //--- I have no idea what I'm doing
        let posX = m_ClickTilePos[0] - (Game.GetClickPos()[0] - ev.clientX) * coef;
        let posY = m_ClickTilePos[1] - (Game.GetClickPos()[1] - ev.clientY) * coef;
    
        //--- Snap to grid
        if (snap)
        {
            var gridTransform = new DOMPointReadOnly(posX, posY).matrixTransform(ISO_MATRIX.inverse());
            gridTransform.x = Math.round(gridTransform.x);
            gridTransform.y = Math.round(gridTransform.y);
            SetTileTransform(m_SelectedTile, gridTransform);
        }
        else
        {
            m_TargetPos[0] = posX;
            m_TargetPos[1] = posY;
        }
    }
    
    function SetTilePos(tile, gridX, gridY)
    {
        SetTileTransform(tile, new DOMPointReadOnly(gridX, gridY));
    }
    
    function SetTileTransform(tile, gridTransform)
    {
        //--- Check if some tile (including itself) already occupies the coordinates
        for (let i = 0; i < m_Tiles.length; i++)
        {
            if (IsElementVisible(m_Tiles[i]) && m_Tiles[i].getAttribute(VAR_GRID_X) == gridTransform.x && m_Tiles[i].getAttribute(VAR_GRID_Y) == gridTransform.y)
            {
                //--- Return back to original position in case of collision with existing tile
                gridTransform.x = tile.getAttribute(VAR_GRID_X);
                gridTransform.y = tile.getAttribute(VAR_GRID_Y);
                break;
            }
        }

        //if (tile.getAttribute(VAR_GRID_X) == gridTransform.x && tile.getAttribute(VAR_GRID_Y) == gridTransform.y)
        //    return;
    
        //--- Save grid position
        tile.setAttribute(VAR_GRID_X, gridTransform.x);
        tile.setAttribute(VAR_GRID_Y, gridTransform.y);
    
        //--- Set screen position
        let gameTransform = gridTransform.matrixTransform(ISO_MATRIX);

        tile.setAttribute(VAR_TARGET_X, gameTransform.x);
        tile.setAttribute(VAR_TARGET_Y, gameTransform.y);

        if (tile == m_CurrentTile)
        {
            m_TargetPos[0] = gameTransform.x;
            m_TargetPos[1] = gameTransform.y;
        }
        else
        {
            tile.setAttribute("x", gameTransform.x);
            tile.setAttribute("y", gameTransform.y);
        }
    
        //Debug.Log(tile.id, gridTransform.x, gridTransform.y);
        UpdateTiles();
    }
    
    function UpdateTiles()
    {
        m_TilesZSorted.sort((a, b) => parseInt(a.getAttribute(VAR_TARGET_Y)) - parseInt(b.getAttribute(VAR_TARGET_Y)));
    
        for (let i = 0; i < m_TilesZSorted.length; i++)
        {
            m_TilesElement.appendChild(m_TilesZSorted[i]);
            AnimateTile(m_TilesZSorted[i], false);
        }
    }
    
    function EvaluateTile(tile, isManual)
    {
        let isConfirmed = tile.getAttribute(VAR_CONFIRMED) != null;
        if (!isConfirmed && tile.getAttribute(VAR_GRID_X) == tile.getAttribute(VAR_GRID_TARGET_X) && tile.getAttribute(VAR_GRID_Y) == tile.getAttribute(VAR_GRID_TARGET_Y))
        {
            tile.setAttribute(VAR_CONFIRMED, true);
            SetTileState(tile, TILE_STATE_CONFIRMED);
            tile.classList.add(CLASS_TILE_CONFIRMED);
    
            if (isManual)
            {
                //RevealNextTile();
                PlayAudio("tileMove");
            }
            
            //--- #HACK
            let tilePicture = tile.getElementById(ID_TILE_CONTENT);
            tilePicture.setAttribute("transform","translate(-128,-128)");

            //--- Hide tile hint (and remove its animation, so it will be restarted once it's added again)
            SetElementVisible(m_TileHint, false);
            m_TileHint.classList.remove("animTileHintDelayed");
            
            //--- Hide tile-specific elements
            let elements = Game.GetSVGDoc().getElementsByClassName("unlock");
            for (let i = 0; i < elements.length; i++)
            {
                SetElementVisible(elements[i], false);
            }

            //--- Send custom event
            let ev = new CustomEvent(EVENT_TILE_CONFIRMED,{detail: {
                tile: tile,
                isLast: tile == m_Tiles[m_Tiles.length - 1],
                isManual: isManual
            }});
            window.dispatchEvent(ev);

            //m_ConfirmedCount++;
            return true;
        }
        else
        {
            SetTileState(tile, TILE_STATE_EDITABLE);
            return false;
        }
    }
    
    function AnimateTile(tile, animate)
    {
        let tilePicture = tile.getElementById(ID_TILE_CONTENT);
        if (tilePicture == null)
            return;

        if (animate)
            tilePicture.setAttribute("class", "animTileConfirmed");
        else
            tilePicture.setAttribute("class", "");
    }
    
    function SetTileState(tile, state)
    {
        let tileArea = tile.getElementById(ID_TILE_AREA);
        tileArea.setAttribute("class", state);
    }

    function SetCurrentTile(tile)
    {
        //--- Unmark the previous current tile
        if (m_CurrentTile)
        {
            m_CurrentTile.classList.remove(CLASS_TILE_CURRENT);
            m_CurrentTile = null;
        }
        
        m_CurrentTile = tile;
        m_TargetPos = [];

        if (m_CurrentTile)
        {
            SetElementVisible(m_CurrentTile, true);
            m_CurrentTile.classList.add(CLASS_TILE_CURRENT);
        }
    }

    function RevealNextTile()
    {
        //--- Show tile
        let index = 0;
        for (let i = 0; i < m_Tiles.length; i++)
        {
            //--- Reveal the next tile in line, one by one
            if (!IsElementVisible(m_Tiles[i]))
            {
                index = i;
                SetCurrentTile(m_Tiles[i]);
                break;
            }
        }

        //--- Show tile-specific elements
        let elements = Game.GetSVGDoc().getElementsByClassName("unlock");
        for (let i = 0; i < elements.length; i++)
        {
            let min = elements[i].getAttribute(VAR_TILE_MIN);
            let max = elements[i].getAttribute(VAR_TILE_MAX);

            SetElementVisible(elements[i], (min == null || index >= min) && (max == null || index <= max));
        }

        //--- Update tile hint's position
        const targetX = m_CurrentTile.getAttribute(VAR_GRID_TARGET_X);
        const targetY = m_CurrentTile.getAttribute(VAR_GRID_TARGET_Y);
 
        var hintTransform = new DOMMatrix(ISO_MATRIX).translateSelf(targetX, targetY, 0);
        m_TileHint.setAttribute("transform", hintTransform);
        SetElementVisible(m_TileHint, true);

        if (index > 1)
        {
            //--- Show tile hint for subsequent tiles only after a delay
            if (index == m_Tiles.length - 1)
                m_TileHint.classList.add("animTileHintLast");
            else
                m_TileHint.classList.add("animTileHintDelayed");

            //--- Fade in the tile (not for the first one)
            m_CurrentTile.querySelector("#tileContent").classList.add("tileFadeIn");
        }
    }

    function CheatRevealAll()
    {
        SetCurrentTile(null); //--- Prevent position lerping of the current tile
        for (let i = 0; i < m_Tiles.length - 1; i++)
        {
            if (m_Tiles[i].getAttribute(VAR_CONFIRMED) == null)
            {
                SetElementVisible(m_Tiles[i], true);
                SetTilePos(m_Tiles[i], m_Tiles[i].getAttribute(VAR_GRID_TARGET_X), m_Tiles[i].getAttribute(VAR_GRID_TARGET_Y));
                EvaluateTile(m_Tiles[i], false);
            }
        }
        RevealNextTile();
    }
}