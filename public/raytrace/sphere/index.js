const canvas = document.querySelector("#glCanvas");
const gl = canvas.getContext("webgl");
let vertexShader = null;
let fragmentShader = null;
let shaderProgram = null;

let positionBuffer = null;
let positionLocation = null;
let positionData = null;

let sphereData = null;
let sphereLocation = null;

let oldTime = null;

const vsSource = `
attribute vec4 position;
varying vec2 st;

void main(void) {
  gl_Position = position;
  st = position.st;
}
`;

const fsSource = `
#define sphereCount 4
#define focalLength 4
#define rayCountMax 1

precision mediump float;
uniform vec4 sphere[sphereCount];
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
        vec3 spherePosition = sphere[sphereIndex].xyz;
        float sphereRadius = sphere[sphereIndex].w;
        vec3 sphereColor = vec3(mod(spherePosition.x, 1.0), mod(spherePosition.y, 1.0), mod(spherePosition.z, 1.0), 1.0);
        float a = dot(rayDirection, rayDirection);
        vec3 f = rayPosition - spherePosition;
		float b = dot(2.0 * rayDirection, f);
		float c = dot(f, f) - (sphereRadius * sphereRadius);
		float d = (b * b) - 4.0 * a * c;
		float e = sqrt(d);
		float t0 = (-b + e) / (2.0 * a);
		float t1 = (-b - e) / (2.0 * a);

        // to avoid branching multiply by the max
        // thus we technically always add all sphere colors
        float m = max(d, 0.0);
        rayColor = rayColor + vec4(1, 0, 0, 1) * m;
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

    positionLocation = gl.getAttribLocation(shaderProgram, "position");
    sphereLocation = gl.getUniformLocation(shaderProgram, "sphere");
    cameraPositionLocation = gl.getUniformLocation(shaderProgram, "cameraPosition");
    cameraRotationLocation = gl.getUniformLocation(shaderProgram, "cameraRotation");

    positionData = new Float32Array([
        -1.0, -1.0, 0.0,
        +1.0, -1.0, 0.0,
        -1.0, +1.0, 0.0,
        +1.0, +1.0, 0.0,
    ]);
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.STATIC_DRAW);

    sphereData = new Float32Array([
        +0.0, 0.0, -1.0, 1.0,
        +1.0, 0.0, -2.0, 1.0,
        +2.0, 0.0, +1.0, 1.0,
        +3.0, 0.0, +2.0, 1.0,
    ]);

    cameraPosition = vec3.create();
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

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, positionData.length / 3);

    gl.uniform4fv(sphereLocation, sphereData);
    gl.uniform3fv(cameraPositionLocation, cameraPosition);
    gl.uniformMatrix3fv(cameraRotationLocation, false, cameraRotation);

    window.requestAnimationFrame(render);
};

init();
window.requestAnimationFrame(render);
