export const sendToElectron = (channel: string, data: any) => {
  if (window.electron) {
    window.electron.send(channel, data);
  }
};

export const receiveFromElectron = (channel: string, callback: (data: any) => void) => {
  if (window.electron) {
    window.electron.receive(channel, callback);
  }
};