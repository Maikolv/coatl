// El build incluye este código y el motor en el mismo Blob.
self.onmessage = ({data: {id, e, modelo}}) => {
  self.postMessage({id, mc: monteCarlo(e), rango: rangoP(modelo)});
};
