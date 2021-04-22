const canvas = document.querySelector("#glCanvas");
const gl = canvas.getContext("webgl");

const render = () => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
};

window.requestAnimationFrame(render);