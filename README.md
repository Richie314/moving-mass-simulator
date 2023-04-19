# Simulazione due masse e molla
Simulazione di un sistema con due oggetti: uno in grado di muoversi su un tavolo senza attrito e uno sotto al tavolo, attaccato al primo tramite un filo.
Sono esaminati varie casistiche: il filo può essere estensibile o non e vari modi di integrazione numerica possono essere selezionati

La simulazione è utilizzabile tramite Github Pages all'indirizzo: https://richie314.github.io/moving-mass-simulator/

La simulazione impiega la libreria <a href="https://github.com/MikeMcl/decimal.js">Decimal.js</a> per le integrazioni numeriche e la libreria
<a href="https://github.com/mrdoob/three.js/">three.js</a> per il rendring 3D. 
La libreria <a href="https://github.com/mathjax/MathJax">MathJax</a> è usata per visualizzare il LateX.

La funzionalità di esportazione, realizzata tramite <a href="https://github.com/SheetJS/sheetjs">SheetJS</a>, permette di generare un foglio di calcolo
Microsoft Excel, che può permettere di eseguire analisi più approfondite come grafici.

Esempi grafici Excel ottenuti dagli export dei dati:

![molla normale](./assets/exports/hard-spring.png?raw=true)
![Molla debole](./assets/exports/soft-spring.png?raw=true)
![Integrazione in nanosecondi](./assets/exports/nanosecs.png?raw=true)
