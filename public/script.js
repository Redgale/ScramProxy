function cloak(type) {
    const url = window.location.href;
    if (type === 'about:blank') {
        const win = window.open();
        win.document.body.innerHTML = `<iframe src="${url}" style="width:100%;height:100%;border:none;position:fixed;top:0;left:0;"></iframe>`;
    } else if (type === 'blob') {
        const html = `<html><body style="margin:0;"><iframe src="${url}" style="width:100%;height:100%;border:none;position:fixed;top:0;left:0;"></iframe></body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        window.open(URL.createObjectURL(blob));
    }
}