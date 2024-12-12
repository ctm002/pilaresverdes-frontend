function loadImages() {
    setInterval(() => {
        var index = Math.floor(Math.random()*3);
        document.querySelector('body').style['background-image'] = "url('images/img" + index + ".jpg')";
    }, "5000");
    
}