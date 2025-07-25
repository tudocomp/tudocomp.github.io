var inField;
var outField;
var separatorField;
var dataStructures;
var options;

var defaultStructures;
var defaultOptions;
var defaultSeparator;

var updateRequested = true;
var updateReady = true;
function updateHistory() {
    if(!updateReady) updateRequested = true;
    else {
        updateReady = false;
        updateHistoryInternal();
        setTimeout(function() {
            updateReady = true;
            if(updateRequested) {
                updateRequested = false;
                updateHistory();
            }
        }, 1000);
    }
}

function updateHistoryInternal() {
    var structsStr = dataStructures.getEnabled();
    var optsStr = options.getEnabled();
 
    var newQuery = $.query.empty();
    var inText;
    if(options.enabled("whitespace"))
        inText = decodeWhitespaces(inField.value);
    else inText = inField.value;
    
    if(inText) newQuery = newQuery.set("text", inText);
    if(structsStr != defaultStructures) newQuery = newQuery.set("structures", structsStr);
    
    var sep = decodeWhitespaces(separatorField.value);
    if(sep != defaultSeparator) newQuery = newQuery.set("sep", sep);
    
    if(optsStr != defaultOptions) newQuery = newQuery.set("options", optsStr);
    
    window.history.replaceState("", "", window.location.pathname + newQuery.toString());
}

function updateTextAreas() {
    updateTextArea(inField);
    updateTextArea(outField);
}

function updateTextArea(area) {
    area.style.height = ""; 
    area.style.height = (10 + area.scrollHeight) + 'px';
}

function encodeWhitespaces(string) {
    return string.replace(/\n/g, '\u21b5').replace(/\s/g, '\u23b5');
}

function decodeWhitespaces(string) {
    return string.replace(/\u21b5/g, '\n').replace(/\u23b5/g, ' ');
}

var wasWhitespace = false;
function updateWhitespaces() {
    if(options.enabled("whitespace")) {
        var selStart = inField.selectionStart;
        var selEnd = inField.selectionEnd;
        inField.value = encodeWhitespaces(inField.value);
        inField.selectionStart = selStart;
        inField.selectionEnd = selEnd;
        wasWhitespace = true;
    }
    else if(wasWhitespace) {
        var selStart = inField.selectionStart;
        var selEnd = inField.selectionEnd;
        inField.value = decodeWhitespaces(inField.value);
        inField.selectionStart = selStart;
        inField.selectionEnd = selEnd;
        wasWhitespace = false;
    }
}

function number_of_runs(text) {
	var runs = 1;
	var runchar = text[0];
	for(var i = 1; i < text.length; ++i) {
		if(text[i] != runchar) {
			++runs;
			runchar = text[i];
		}
	}
	return runs;
}

function number_of_ones(text) {
	var count = 0;
	for(var i = 0; i < text.length; ++i) {
		if(text[i] == 1) {
			++count;
		}
	}
	return count;
}


var varText, varIndex, varSA, varISA, varPHI, varPhiInv, varLCP, varPLCP, varPSI, varF, varBWT, varBBWT, varLF, varLPF, varSAIS, varLZ77, varBorderArray, varLexParse, varLyndon, varRota, varCircularSA, varCircularISA, varBBWTCycles, varSC; 
var varBBWTInv;
function updateArrays() {
    separatorField.value = encodeWhitespaces(separatorField.value);
    updateWhitespaces();
    if(options.enabled("whitespace"))
        varText = decodeWhitespaces(inField.value);
    else 
        varText = inField.value;

    if(!varText) varText = inField.placeholder;

    var varBase = 0;
    if(options.enabled("baseone")) varBase = 1;
    if(options.enabled("dollar")) varText += '\0';

    if(varText.length > 0) {
        varIndex = indexArray(varText.length, varBase);
		varBorderArray = borderArray(varText);
        varSA = suffixArray(varText, varBase);
        varISA = inverseSuffixArray(varSA, varBase);
        varPHI = phiArray(varSA, varISA, varBase);
        varPHIInv = phiArrayInverse(varSA, varISA, varBase);
        varLCP = lcpArray(varText, varSA, varBase);
				varSC = substring_complexity(varLCP);
        varPLCP = plcpArray(varISA, varLCP, varBase);
        varPSI = psiArray(varSA, varISA, varBase);
        varF = firstRow(varText);
        varRota = rotationArray(varText, varBase);
        varBWT = bwt(varText, varRota, varBase);
        varLF = lfArray(varText, varBase);
        varLPF = lpfArray(varText, varBase);
        varSAIS = slArray(varText, varBase);
        varLZ77 = LZ77Fact(varText, varBase);
        varLexParse = lexParse(varText, varPLCP, varBase);
        varLyndonFactorization = lyndonFact(varText, varISA, varBase);
        varBBWTInv = bbwt_inverse(varText);
        var varBBWTObject =  bbwt(varText, varLyndonFactorization, varBase);
        varBBWT = varBBWTObject.str;
        varBBWTCycles = varBBWTObject.ids;
        varCircularSA = ciruclar_sa(varText, varLyndonFactorization, varBase);
        varCircularISA =inverseSuffixArray(varCircularSA, varBase);
        varNSS = nssArray(varText, varISA, varBase);
        varPSS = pssArray(varText, varISA, varBase);
        varLyndonArray = lyndonArray(varText, varNSS, varBase);

		document.getElementById('bbwtruns').innerHTML = number_of_runs(varBBWT);
		document.getElementById('bwtruns').innerHTML = number_of_runs(varBWT);
		document.getElementById('textruns').innerHTML = number_of_runs(varText);
		document.getElementById('lz77factors').innerHTML = number_of_ones(varLZ77)+1;
		document.getElementById('lyndonfactors').innerHTML = number_of_ones(varLyndonFactorization);
		document.getElementById('lexparsefactors').innerHTML = number_of_ones(varLexParse)+1;

		var delta = compute_delta(varSC);
		document.getElementById('substring_complexity').innerHTML = '&delta; = ' + delta[1] + '(index=' + delta[0] + ')';
		var textlength = varBorderArray.length;
		var lastborder = varBorderArray[textlength-1];
		var period = textlength-lastborder;
		var exponent = textlength/period;
		document.getElementById('exponent').innerHTML = exponent;
		document.getElementById('period').innerHTML = period;
		if(exponent > 1 && textlength % period == 0) {
			document.getElementById('regularity').innerHTML = '<b>non-primitive</b>';
			if(exponent % 2 == 0) {
				document.getElementById('regularity').innerHTML = '<b>square</b>';
			}
		} else {
			document.getElementById('regularity').innerHTML = '<i>primitive</i>';
			if(lastborder == 0) {
				document.getElementById('regularity').innerHTML += ', <b>unbordered</b>';
			}
		}
    }
    
    var sep = decodeWhitespaces(separatorField.value);
    
    var pad = 0;
    dataStructures.forEachEnabled(function(dsName) {
        if (dsName.length > pad) pad = dsName.length;
    });
    
    var result = "";
    dataStructures.forEachEnabled(function(dsName) {
        var varDs = window["var" + dsName];
        if(dataStructures.isString(dsName)) {
            if(options.enabled("whitespace")) {
                // varDs = encodeWhitespaces(varDs);
						}
						varDs = stringToString(varDs, sep, varBase, options.enabled("tabularize"));
        } else if(dataStructures.isFactorization(dsName)) {
            if(options.enabled("facttext")) {
            varDs = factorizationToText(options.enabled("whitespace") ? encodeWhitespaces(varText) : varText, varDs, sep, varBase);
            } else { 
							varDs = arrayToString(varDs, sep, varBase); 
						}
        } else { 
					varDs = arrayToString(varDs, sep, varBase); 
				}
        result += padRight(dsName + ":", ' ', pad + 2) + varDs + "\n";
    });
    outField.value = result.substr(0, result.length - 1);

    updateTextAreas();
    updateHistory();
}

function initDragAndDrop(listEnabled, listDisabled) {
    Sortable.create(listEnabled, {
        group: 'qa-structs',
        draggable: '.qa-structure',
        ghostClass: 'qa-structure-ghost',
        dragClass: 'qa-structure-drag',
        onSort: updateArrays
    });
    Sortable.create(listDisabled, {
        group: 'qa-structs',
        draggable: '.qa-structure',
        ghostClass: 'qa-structure-ghost',
        dragClass: 'qa-structure-drag'
    });
}

window.onload = function () {
    inField = document.getElementById('textSource');
    outField = document.getElementById('arraysDestination');
    separatorField = document.getElementById('separatorSource');
    structuresListEn = document.getElementById('qa-structures-enabled');
    structuresListDis = document.getElementById('qa-structures-disabled');
    
    // initalize data structure settings container
    var structureElements = document.getElementsByClassName("qa-structure");
    dataStructures = new DataStructureList(structuresListEn, structuresListDis, updateArrays, true);
    for(var i = 0; i < structureElements.length; i++) dataStructures.add(structureElements[i]);
    defaultStructures = dataStructures.getEnabled();
    
    // initialize option settings container
    var optionElements = document.getElementsByClassName("qa-option-cbx");
    options = new OptionList(updateArrays);
    for(var i = 0; i < optionElements.length; i++) options.add(optionElements[i]);
    defaultOptions = options.getEnabled();
    
    defaultSeparator = " ";
    separatorField.value = encodeWhitespaces(defaultSeparator);
    
    // parse configuration from GET url parameters
    var textquery = $.query.get("text").toString();
    if(textquery) inField.value = textquery;
    var queryStructures = $.query.get("structures").toString();
    if(queryStructures) dataStructures.setEnabled(queryStructures);
    var queryOptions = $.query.get("options").toString();
    if(queryOptions) options.setEnabled(queryOptions);    
    var sepfromquery = $.query.get("sep").toString();
    if(sepfromquery) 
        if(sepfromquery == "true") 
            separatorField.value = ""; 
        else 
            separatorField.value = encodeWhitespaces(sepfromquery)

    // update output while typing
    inField.oninput = updateArrays;
    inField.onpropertychange = updateArrays;
    separatorField.oninput = updateArrays;
    separatorField.onpropertychange = updateArrays;

    updateArrays();
    updateHistoryInternal();
    initDragAndDrop(structuresListEn, structuresListDis);
};
