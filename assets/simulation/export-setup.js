'use strict';
var TimeMax = new Decimal(1);
UpdateTimeMax();

var dtExportCount = 250;
const dtExportCountInput = document.getElementById('dt-export-count');
const dtExportCountShow = document.getElementById('dt-export-count-value-display');
function UpdateDtExportCount()
{
    dtExportCount = Number(dtExportCountInput.value);
    dtExportCountShow.innerHTML = dtExportCount;
}
dtExportCountInput.addEventListener('input', UpdateDtExportCount);
UpdateDtExportCount();

let exportWorker = null;

function Export()
{
    const exportSim = new Simulation(
        simulation.Engine, 
        tableMass.clone(), 
        fallingMass.clone(), 
        null, null, 
        TableMeasures, dtCount);
    RefreshSimulationParams(exportSim);
    if (!exportWorker)
    {
        exportWorker = new Worker('./assets/simulation/export-worker.js');
        exportWorker.addEventListener('message', msg => {
            const obj = JSON.parse(msg.data);
            if (!('simulation' in obj))
                return;
            const id = Number(obj.simulation);
            switch (obj.action)
            {
                case 'simulation-start': {
                    ExportStarted(id);
                } break;
                case 'simulation-end': {
                    ExportEnded(id);
                } break;
                case 'error-report': {
                    const message = String(obj.message);
                    ExportError(id, message);
                } break;
                case 'status-update': {
                    const message = String(obj.message);
                    ExportUpdate(id, message);
                } break;
                case 'send-file': {
                    const file = obj.file;
                    ReceiveFile(id, file);
                } break;
                default: {
                    console.log(obj);
                }
            }
        });
        exportWorker.addEventListener('error', msg => {
            err(msg.message);
            const old_text = exportBtn.innerHTML;
            exportBtn.innerHTML = 'Errore in worker!!';
            setTimeout(() => exportBtn.innerHTML = old_text, 4000);
            exportWorker.terminate();
            exportWorker = null;
        });
    }
    const sim = {
        startSimulation: 'yes',
        engine: exportSim.Engine.name,
        table: {
            mass: exportSim.tableMass.mass,

            r: exportSim.tableMass.r,
            r1: exportSim.tableMass.rPrime,
            r2: exportSim.tableMass.rDoublePrime,

            t: exportSim.tableMass.theta,
            t1: exportSim.tableMass.thetaPrime,
            t2: exportSim.tableMass.thetaDoublePrime
        },
        falling: {
            mass: exportSim.fallingMass.mass,

            h: exportSim.fallingMass.height,
            h1: exportSim.fallingMass.heightPrime,
            h2: exportSim.fallingMass.heightDoublePrime
        },
        dt: exportSim.dt,
        dtCount: exportSim.dtCount,
        k: exportSim.k,
        cable: exportSim.cable,
        cavalieriWeight: exportSim.cavalieriWeight,
        timeMax: TimeMax,
        exportFreq: dtExportCount
    }
    //This will start the export
    exportWorker.postMessage(JSON.stringify(sim));
}
exportBtn.onclick = () => {
    if (exportBtn.disabled) return;
    pause();
    RefreshSimulationParams(simulation);
    UpdateTimeMax();
    UpdateDtExportCount();
    const expectedRows = TimeMax.div(simulation.dt.times(dtExportCount)).floor().plus(1);
    const totalExpectedRows = TimeMax.div(simulation.dt).floor().plus(1);
    if (!confirm(
        `Stai per avviare il calcolo di un\'intera simulazione.\n` +
        `Sarà creato un file XLSX con ${expectedRows.toSignificantDigits(7)} righe.\n` +
        `Nonostante ciò le righe calcolate saranno ${totalExpectedRows.toSignificantDigits(7)}.\n` +
        `La pagina potrebbe freezarsi; se il browser ti dovesse chiedere di attendere, cliccare su Attendi fino a fine operazione.\n` + 
        `Cliccare Ok per iniziare...`))
        return; 
    reset();
    exportBtn.disabled = true;
    const oldUnload = window.onbeforeunload;
    //window.onbeforeunload = () => 'Sei sicuro di voler chiudere la pagina?\nL\'export in corso andrà perso.';
    Export();    
    exportBtn.disabled = false;
};

function ExportStarted(id)
{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>#${id}</td> <td id="progress-${id}"></td> <td id="action-${id}"><button type="button" onclick="StopExport(${id})"> <i class="material-icons">close</i> </button></td>`;
    tr.id = 'sim-' + id;
    document.getElementById('export-body').appendChild(tr);
}

function ExportEnded(id)
{
    setTimeout(() => document.getElementById('progress-' + id).innerHTML = '<strong>Terminato</strong>', 500);
}

function ExportError(id, message)
{
    document.getElementById('progress-' + id).innerHTML = `<div class="error">${message}</div>`;
}

function ExportUpdate(id, message)
{
    document.getElementById('progress-' + String(id)).innerHTML = `<div class="message">${message}</div>`;
}

function b64toBlob (b64Data, contentType='application/octet-stream', chunkSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += chunkSize)
    {
      const slice = byteCharacters.slice(offset, offset + chunkSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++)
      {
        byteNumbers[i] = slice.charCodeAt(i);
      }      
  
      byteArrays.push( new Uint8Array(byteNumbers) );
    }
  
    return new Blob(byteArrays, { type: contentType });
}

function ReceiveFile(id, allRows)
{
    const td = document.getElementById('action-' + id);
    
    try {
        const blob = b64toBlob(
            allRows, 
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
            1024);
        const a = document.createElement('a');
        a.download = 'export-' + id + '.xlsx';
        a.innerHTML = 'Scarica <i class="material-icons">file_download</i>';
        a.href = window.URL.createObjectURL(blob);
        td.removeChild(td.children[0]);
        td.appendChild(a);
        a.click();
        setTimeout(() => {
            window.URL.revokeObjectURL(a.href);
            a.href = 'javascript:alert("Non più disponibile")';
            a.innerHTML = 'Non pi&ugrave; disponibile';
        }, 100 * 1000);//Deletes the Blob after 100 seconds
        
    } catch (err) {
        warn(err);
    }
}
function StopSimulation(id)
{
    if (!exportWorker)
        return;
    const obj = {
        stopSimulation: 'yes',
        id: id
    };
    exportWorker.postMessage(JSON.stringify(obj));
}