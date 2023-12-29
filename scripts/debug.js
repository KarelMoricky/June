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

        window.addEventListener("GameInit", function ()
        {
            Game.GetSVG().addEventListener("mousedown", (ev) =>
            {
                const transform = new DOMPointReadOnly(ev.clientX, ev.clientY).matrixTransform(m_Game.getScreenCTM().inverse());
                m_Pos.innerHTML = "x: " + Math.round(transform.x) + "<br />y: " + Math.round(transform.y);
            });
        });
    }
}