function saveTextAsFile(filename) {
	var ieMatch = navigator.userAgent.match(/MSIE\s([\d.]+)/),
		isIE11 = navigator.userAgent.match(/Trident\/7.0/) && navigator.userAgent.match(/rv:11/),
		isEdge = navigator.userAgent.match(/Edge/g),
		ieVersion = ieMatch ? ieMatch[1] : isIE11 ? 11 : isEdge ? 12 : -1;
	if (ieMatch && ieVersion < 10) return void console.log("No blobs on IE ver<10");
	var content = tinyMCE.activeEditor.getContent({ format: "text" });
	content = content.replace(/\r?\n/g, "\r\n");
	var blob = new Blob([content], { type: "text/plain" });
	var name = $("#txt_name").val() + ".txt";
	if (ieVersion > -1) {
		window.navigator.msSaveBlob(blob, name);
	} else {
		var link = document.createElement("a");
		link.download = name;
		link.href = window.URL.createObjectURL(blob);
		link.onclick = function (e) {
			document.body.removeChild(e.target);
		};
		link.style.display = "none";
		document.body.appendChild(link);
		link.click();
	}
}

function readFile(file, onload) {
	var reader = new FileReader();
	reader.onload = onload;
	reader.readAsText(file);
}

$(document).ready(function () {
	$("#file_input").on("change", function (e) {
		readFile(this.files[0], function (loaded) {
			tinyMCE.activeEditor.setContent(loaded.target.result.replace(/\r?\n/g, "<br/>"));
		});
	});
});

function openSaveAsDialog(editor) {
	editor.windowManager.open({
		title: "Save As",
		width: 340,
		height: 90,
		onsubmit: function () {
			saveTextAsFile();
		},
		body: [{ type: "textbox", id: "txt_name", label: "Filename:" }],
		buttons: [
			{
				text: "Save",
				onclick: function () {
					saveTextAsFile();
					editor.windowManager.close();
				},
			},
		],
	});
}

var config = {};
config = $.extend(config, {
	resize: false,
	oninit: "setPlainText",
	paste_as_text: true,
	height: 800,
	autoresize_min_height: 800,
	autoresize: true,
	autosave_interval: "1s",
	autosave_restore_when_empty: true,
	browser_spellcheck: true,
	autosave_ask_before_unload: false,
	entity_encoding: "raw",
	paste_data_images: false,
	elementpath: false,
	autosave_retention: "525600m",
	menu: {
		file: { title: "File", items: "newdocument savefile loadfile print" },
		edit: { title: "Edit", items: "undo redo | cut copy paste | selectall | searchreplace" },
		insert: { title: "Insert", items: "insertdatetime | charmap nonbreaking" },
		view: { title: "View", items: "fontselect preview fullscreen" },
		help: { title: "Help", items: "shortcuts | about" },
	},
	setup: function (editor) {
		editor.addMenuItem("savefile", {
			context: "file",
			text: "Save",
			icon: "save",
			shortcut: "Ctrl+S",
			onclick: function () {
				openSaveAsDialog(editor);
			},
		});
		editor.addMenuItem("loadfile", {
			context: "file",
			text: "Open...",
			icon: "browse",
			shortcut: "Ctrl+O",
			onclick: function () {
				$("#file_input").click();
			},
		});
		editor.addMenuItem("about", {
			text: "Homepage",
			icon: false,
			onclick: function () {
				window.location.href = "../../";
			},
		});
		editor.addMenuItem("shortcuts", {
			text: "Shortcuts",
			icon: false,
			onclick: function () {
				window.location.href = "keyboard-shortcuts.html";
			},
		});
		editor.addButton("loadfile", {
			icon: "browse",
			title: "Open...",
			onclick: function () {
				$("#file_input").click();
			},
		});
		editor.on("init", function () {
			editor.addShortcut("meta+o", "", function () {
				$("#file_input").click();
			});
			editor.addShortcut("meta+b", "", "");
			editor.addShortcut("meta+i", "", "");
			editor.addShortcut("meta+u", "", "");
			editor.addShortcut("meta+s", "", function () {
				openSaveAsDialog(editor);
			});
		});
		tinymce.PluginManager.add("filesaver", function (editor) {
			editor.addButton("filesave", {
				title: "Save",
				icon: "save",
				onclick: function () {
					openSaveAsDialog(editor);
				},
			});
		});
	},
});
config.forced_root_block = navigator.userAgent.search(/webkit/i) > 0 ? "div" : false;
config.toolbar = ["newdocument loadfile filesave print | cut copy paste | undo redo | searchreplace  | fontselect fontsizeselect | fullscreen"];
config.plugins = ["autoresize print searchreplace fullscreen autosave paste insertdatetime charmap nonbreaking fullscreen filesaver wordcount "];
config.selector = "#editor";
config.content_css = ["css/app.css"];
tinyMCE.init(config);
