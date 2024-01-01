var Debug = new function()
{
    var m_IsDev = DEV_MODE && window.location.href.startsWith("http://127.0.0.1");

    var m_Log = document.getElementById("log");
    var m_Pos = document.getElementById("pos");

    this.IsDev = function()
    {
        return m_IsDev;
    }

    this.Log = function()
    {
        if (!m_IsDev)
            return;

        var now = new Date().toTimeString().slice(0,8);
        let text = "<small style='color: grey;'>[" + now + "]</small>";
        for (let i = 0; i < arguments.length; i++)
        {
            text += "<br />" + arguments[i];
        }
        m_Log.innerHTML = text;
    }

    if (m_IsDev)
    {
        document.title = "[DEV] " + document.title;

        window.addEventListener(EVENT_GAME_INIT, function ()
        {
            Game.GetSVG().addEventListener("mousemove", (ev) =>
            {
                let gamePos = Game.ToGameCoords(ev.clientX, ev.clientY);
                m_Pos.innerHTML =
                      "client.x: " + ev.clientX 
                    + "<br />client.y: " + ev.clientY
                    + "<br />"
                    + "game.x: " + Math.round(gamePos.x)
                    + "<br />game.y: " + Math.round(gamePos.y);
            });
        });
    }
}