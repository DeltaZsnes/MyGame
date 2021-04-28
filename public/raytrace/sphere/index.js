const canvas = document.querySelector("#glCanvas");
const gl = canvas.getContext("webgl");
let vertexShader = null;
let fragmentShader = null;
let shaderProgram = null;

let vertexPositionBuffer = null;
let vertexPositionLocation = null;
let vertexPositionData = null;

let spherePositionList = null;
let sphereColorList = null;
let spherePositionLocation = null;
let sphereColorLocation = null;

let oldTime = null;

const vsSource = `
attribute vec4 vertexPosition;
varying vec2 st;

void main(void) {
  gl_Position = vertexPosition;
  st = vertexPosition.st;
}
`;

const fsSource = `
#define sphereCount 4
#define focalLength 4
#define rayCountMax 1

precision mediump float;
uniform vec4 spherePosition[sphereCount];
uniform vec4 sphereColor[sphereCount];
uniform vec3 cameraPosition[1];
uniform mat3 cameraRotation[1];
varying vec2 st;

void main(void) {
    vec3 rayPosition;
	vec3 rayDirection;
	int rayCount = 0;

    vec4 background = vec4(0.1, 0.2, 0.3, 1.0);
    vec4 rayColor = background;

    rayPosition = cameraPosition[0];
	rayDirection = cameraRotation[0] * vec3(st, focalLength);
    rayCount++;

    for(int sphereIndex = 0; sphereIndex < sphereCount; sphereIndex++)
	{
        vec3 position = spherePosition[sphereIndex].xyz;
        float radius = spherePosition[sphereIndex].w;
        vec4 color = sphereColor[sphereIndex];
        float a = dot(rayDirection, rayDirection);
        vec3 f = rayPosition - position;
		float b = dot(2.0 * rayDirection, f);
		float c = dot(f, f) - (radius * radius);
		float d = (b * b) - 4.0 * a * c;
		float e = sqrt(d);
		float t0 = (-b + e) / (2.0 * a);
		float t1 = (-b - e) / (2.0 * a);

        // to avoid branching multiply by the max
        // thus we technically always add all sphere colors
        float m = max(d, 0.0);
        rayColor = rayColor + color * m;
    }

    gl_FragColor = rayColor;
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

    vertexPositionLocation = gl.getAttribLocation(shaderProgram, "vertexPosition");
    spherePositionLocation = gl.getUniformLocation(shaderProgram, "spherePosition");
    sphereColorLocation = gl.getUniformLocation(shaderProgram, "sphereColor");
    cameraPositionLocation = gl.getUniformLocation(shaderProgram, "cameraPosition");
    cameraRotationLocation = gl.getUniformLocation(shaderProgram, "cameraRotation");

    vertexPositionData = new Float32Array([
        -1.0, -1.0, 0.0,
        +1.0, -1.0, 0.0,
        -1.0, +1.0, 0.0,
        +1.0, +1.0, 0.0,
    ]);
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPositionData, gl.STATIC_DRAW);

    spherePositionList = new Float32Array([
        +0.0, 0.0, -1.0, 1.0,
        +1.0, 0.0, -2.0, 1.0,
        +2.0, 0.0, +1.0, 1.0,
        +3.0, 0.0, +2.0, 1.0,
    ]);

    sphereColorList = new Float32Array([
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
    ]);

    cameraPosition = vec3.fromValues(0, 0, -20);
    cameraRotation = mat3.create();

    document.addEventListener('keypress', (e) => {
        switch (e.key) {
            case "w":
                vec3.add(cameraPosition, cameraPosition, vec3.fromValues(0, 0, +1));
                break;
            case "s":
                vec3.add(cameraPosition, cameraPosition, vec3.fromValues(0, 0, -1));
                break;
            case "a":
                vec3.add(cameraPosition, cameraPosition, vec3.fromValues(-1, 0, 0));
                break;
            case "d":
                vec3.add(cameraPosition, cameraPosition, vec3.fromValues(+1, 0, 0));
                break;
            case "q":
                break;
            case "r":
                break;
        }
    });
};

const render = () => {
    let newTime = performance.now();
    // console.log(1000.0/(newTime - oldTime));
    oldTime = newTime;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK);

    gl.useProgram(shaderProgram);

    gl.enableVertexAttribArray(vertexPositionLocation);
    gl.vertexAttribPointer(vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPositionData.length / 3);

    gl.uniform4fv(spherePositionLocation, spherePositionList);
    gl.uniform4fv(sphereColorLocation, sphereColorList);
    gl.uniform3fv(cameraPositionLocation, cameraPosition);
    gl.uniformMatrix3fv(cameraRotationLocation, false, cameraRotation);

    window.requestAnimationFrame(render);
};

init();
window.requestAnimationFrame(render);
