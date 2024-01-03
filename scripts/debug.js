var Debug = new function()
{
    var m_IsDev = DEV_MODE && window.location.href.startsWith("http://127.0.0.1");

    this.IsDev = function()
    {
        return m_IsDev;
    }

    this.Log = function()
    {
        if (!m_IsDev || !m_Log)
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

        var m_StartTime = new Date();

        var m_Log = document.getElementById("log");
        var m_Pos = document.getElementById("pos");

        SetElementVisible(document.getElementById("disclaimer"), false);

        window.addEventListener(EVENT_GAME_INIT, OnGameInit);
        function OnGameInit()
        {
            var m_Client = {x: 0, y: 0};
            requestAnimationFrame(OnEachFrame);
            function OnEachFrame()
            {
                var duration = Math.round((new Date() - m_StartTime) / 1000);
                let gamePos = Game.ToGameCoords(m_Client.x, m_Client.y);
                m_Pos.innerHTML =
                    "<small style='color: grey;'>[" + duration + " s]</small><br />"
                    + "client.x: " + m_Client.x
                    + "<br />client.y: " + m_Client.y
                    + "<br />"
                    + "game.x: " + Math.round(gamePos.x)
                    + "<br />game.y: " + Math.round(gamePos.y);

                requestAnimationFrame(OnEachFrame);
            }

            window.addEventListener(EVENT_GAME_INIT, function ()
            {
                Game.GetSVG().addEventListener("mousemove", (ev) =>
                {
                    m_Client.x = ev.clientX;
                    m_Client.y = ev.clientY;
                });
            });
        }
    }
}