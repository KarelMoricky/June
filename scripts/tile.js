var Tile = new function()
{
    const INERTIA_DEFAULT = 0.02;

    const ID_TILE_AREA = "tileArea";
    const ID_TILE_CONTENT = "tileContent";
    //const ID_GRID = "grid";
    
    const CLASS_TILE_SHOWN = "tile";
    const CLASS_TILE_HIDDEN = "tileHidden";
    const CLASS_TILE_CURRENT = "tileCurrent";
    const CLASS_TILE_CONFIRMED = "tileConfirmed";
    
    const TILE_STATE_EDITABLE = "tileStateEditable";
    const TILE_STATE_EDITING = "tileStateEditing";
    const TILE_STATE_CONFIRMED = "tileStateConfirmed";

    const TILE_PICTURE_CURRENT = "tilePictureCurrent";
    
    //--- Grid
    const GRID_SIZE = 12;
    const ISO_SIZE = 140;
    const ISO_MATRIX = new DOMMatrixReadOnly()
        .rotate(30)
        .skewX(-30)
        .scale(1 * ISO_SIZE, 0.8602 * ISO_SIZE);

    var m_Selected;
    var m_AnimatedTile;
    var m_Tiles = [];
    var m_TilesZSorted = [];
    var m_ClickTilePos = [];
    var m_ConfirmedCount = 0;
    //var m_Tier = 0;
    var m_TargetPos = [];
    var m_TimePrev = 0;
    var m_TilesElement = null;
    // var m_Grid;
    // var m_GridDebug;

    this.GetSelected = function()
    {
        return m_Selected;
    }

    this.SetSelected = function(ev)
    {
        m_Selected = null;
        let element = Game.GetSVGDoc().elementFromPoint(ev.clientX, ev.clientY);
        while (element)
        {
            if (element.classList.contains("tile") && !element.getAttribute(VAR_CONFIRMED))
            {
                m_Selected = element;
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
    window.addEventListener(EVENT_PAUSE, OnPause);

    function OnGameInit()
    {
        m_TilesElement = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);

        let i = 0;
        for (let tileID of TARGET_POSITIONS.keys())
        {
            let tile = Game.GetSVGDoc().getElementById(tileID)
    
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
    
            m_Tiles[i] = tile; //--- Must be called after SetTilePos(), otherwise the tile will think it's already occupied
            m_TilesZSorted[i] = tile;
            i++;
        }
        m_Tiles.sort((a, b) => parseInt(a.getAttribute("tileId")) - parseInt(b.getAttribute("tileId")));

        if (Debug.IsDev())
        {
            Game.GetSVG().addEventListener("keydown", OnKeyDown);
        }

        requestAnimationFrame(OnEachFrame);
        
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

    function OnPause(ev)
    {
        if (ev.detail.isPaused)
            return;
        
        RevealNextTile();
        window.removeEventListener(EVENT_PAUSE, OnPause);
    }

    function OnEachFrame()
    {
        let timeNow = Date.now();
        let timeSlice = (timeNow - m_TimePrev) * INERTIA_DEFAULT;
        m_TimePrev = timeNow;

        if (m_AnimatedTile && m_TargetPos.length > 0 && m_AnimatedTile.getAttribute("x") != null)
        {
            let posX = Lerp(m_AnimatedTile.getAttribute("x"), m_TargetPos[0], timeSlice);
            let posY = Lerp(m_AnimatedTile.getAttribute("y"), m_TargetPos[1], timeSlice);

            m_AnimatedTile.setAttribute("x", posX);
            m_AnimatedTile.setAttribute("y", posY);
         }
         
         requestAnimationFrame(OnEachFrame);
    }

    function OnGameDragStart(ev)
    {
        if (!m_Selected)
            return;

        m_TargetPos = [];
        m_AnimatedTile = m_Selected;

        m_ClickTilePos = [parseInt(m_Selected.getAttribute("x")), parseInt(m_Selected.getAttribute("y"))];
        SetTileState(m_Selected, TILE_STATE_EDITING);

        Vibrate(VIBRATION_TILE_DRAG_START);
    }

    function OnGameDrag(ev)
    {
        if (!m_Selected)
            return;

        DragTile(ev, TILE_DRAG_SNAP);
    }

    function OnGameDragEnd(ev)
    {
        if (!m_Selected)
            return;

        DragTile(ev, true);
        let tile = m_Selected;
        m_Selected = null;
        
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

    function OnKeyDown(ev)
    {
        if (ev.keyCode == 32)
        {
            //--- [Space] Auto-place next tile
            for (let i = 0; i < m_Tiles.length; i++)
            {
                if (m_Tiles[i].getAttribute(VAR_CONFIRMED) == null)
                {
                    SetTilePos(m_Tiles[i], m_Tiles[i].getAttribute(VAR_GRID_TARGET_X), m_Tiles[i].getAttribute(VAR_GRID_TARGET_Y));
                    EvaluateTile(m_Tiles[i], false);
                    break;
                }
            }
        }
        else if (ev.keyCode == 192)
        {
            //--- [~] Skip to the last tile
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
            SetTileTransform(m_Selected, gridTransform);
        }
        else
        {
            m_TargetPos[0] = posX;
            m_TargetPos[1] = posY;
            
            //--- Dragged tile always on top
            m_TilesElement.appendChild(m_Selected);
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

        if (tile == m_AnimatedTile)
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
    
            if (isManual)
            {
                //RevealNextTile();
                PlayAudio("tileMove");
            }
            
            //--- #HACK
            let tilePicture = tile.getElementById(ID_TILE_CONTENT);
            tilePicture.setAttribute("transform","translate(-128,-128)");

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
            tilePicture.setAttribute("class", "animateTileConfirmed");
        else
            tilePicture.setAttribute("class", "");
    }
    
    function SetTileState(tile, state)
    {
        let tileArea = tile.getElementById(ID_TILE_AREA);
        tileArea.setAttribute("class", state);
    }

    function RevealNextTile()
    {
        //--- Show tile
        let index = 0;;
        for (let i = 0; i < m_Tiles.length; i++)
        {
            //--- Reveal the next tile in line, one by one
            if (!IsElementVisible(m_Tiles[i]))
            {
                index = i;
                SetElementVisible(m_Tiles[i], true);
                m_Tiles[i].classList.add(TILE_PICTURE_CURRENT);
                break;
            }
        }

        //--- Lock/unlock elements
        let elements = Game.GetSVGDoc().getElementsByClassName("unlock");
        for (let i = 0; i < elements.length; i++)
        {
            let min = elements[i].getAttribute(VAR_TILE_MIN);
            let max = elements[i].getAttribute(VAR_TILE_MAX);

            if ((min == null || index >= min) && (max == null || index <= max))
                elements[i].classList.remove("hidden");
            else
                elements[i].classList.add("hidden");
        }
    }
}