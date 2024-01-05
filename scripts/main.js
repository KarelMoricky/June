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

function SetElementVisible(element, isVisible)
{
    if (isVisible)
        element.classList.remove("hidden");
    else
        element.classList.add("hidden");
}

function IsElementVisible(element)
{
    return !element.classList.contains("hidden");
}

function Vibrate(pattern)
{
    const canVibrate = window.navigator.vibrate;
    if (canVibrate)
        window.navigator.vibrate(pattern);
}

//#endregion

//#region Audio
function PlayAudio(name)
{
    //--- https://www.w3schools.com/JSREF/dom_obj_audio.asp
    let audioObject = document.getElementById(name);
    audioObject.load();
    audioObject.play();
}
//#endregion

//#region Math
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function Lerp(a, b, t)
{
    t = Clamp(t, 0, 1);
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