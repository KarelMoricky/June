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

function GetViewBox(element)
{
    let viewBoxStr = element.getAttribute("viewBox").split(" ");
    let viewBox = [];
    for (let i = 0; i < viewBoxStr.length; i++)
    {
        viewBox[i] = parseInt(viewBoxStr[i]);
    }
    return viewBox;
}

function SetViewBox(element, viewBox)
{
    element.setAttribute("viewBox", viewBox[0] + " " + viewBox[1] + " " + viewBox[2] + " " + viewBox[3]);
}
//#endregion

//#region Audio
function PlaySound(index)
{
    if (index < 0 || index >= m_Sounds.length)
    {
        alert("Cannot play sound, index=" + index + " is out of bounds!");
        return;
    }

    let sound = m_Sounds[index];
    sound.load();
    sound.play();
}

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