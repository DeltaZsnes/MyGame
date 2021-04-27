const canvas = document.querySelector("#glCanvas");
const gl = canvas.getContext("webgl");
let vertexShader = null;
let fragmentShader = null;
let shaderProgram = null;
let positionBuffer = null;
let positionLocation = null;
let positionData = null;

const vsSource = `
attribute vec4 position;

void main(void) {
  gl_Position = position;
}
`;

const fsSource = `
varying lowp vec4 vColor;

void main(void) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

const init = () => {
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);
  
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(vertexShader);
    }

    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);
  
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(fragmentShader);
    }

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    positionLocation = gl.getAttribLocation(shaderProgram, "position");

    positionData = new Float32Array([
        -1.0, -1.0, 0.0,
        +1.0, -1.0, 0.0,
        -1.0, +1.0, 0.0,
        +1.0, +1.0, 0.0,
    ]);
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.STATIC_DRAW);

    // const colors = [
    //     1.0, 1.0, 1.0, 1.0, // white
    //     1.0, 0.0, 0.0, 1.0, // red
    //     0.0, 1.0, 0.0, 1.0, // green
    //     0.0, 0.0, 1.0, 1.0, // blue
    // ];

    // const colorBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        [0.0, 0.0, -6.0]); // amount to translate
};

const render = () => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK);

    gl.useProgram(shaderProgram);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, positionData.length / 3);
};

init();
window.requestAnimationFrame(render);