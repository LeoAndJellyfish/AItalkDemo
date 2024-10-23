import Drawflow from 'drawflow';
import styleDrawflow from 'drawflow/dist/drawflow.min.css';
<div id="drawflow"></div>
var id = document.getElementById("drawflow");
const editor = new Drawflow(id);
editor.start();
styleDrawflow.use();
