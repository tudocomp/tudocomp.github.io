/* fact[i] = 1 means that a factor ends at position i */
function factorizationToText(string, fact, sep = " ", base = 0) {
    var n = string.length;

    var width = ("" + (n + base - 1).toString()).length
    var result = "";
    for(var i = 0; i < n - 1; i++) {
        result += padLeft("" + string[i], ' ', width);
        result += (fact[i] == 1) ? ('|'+sep.substring(1))  : sep;
    }
    result += padLeft("" + (string[n-1] == '\0' ? '$' : string[n-1]), (fact[n-1] == 1) ? '|' : ' ', width);

    return result;
}


function lyndonFact(string, isa, base = 0) {
    var n = string.length;
    var result = new Array(n).fill(0);
    var isaval = isa[0];
    for(var i = 0; i+1 < n; ++i) {
        if(isaval > isa[i+1]) {
            result[i] = 1;
            isaval = isa[i+1];
        }
    }
    return result;
}

function bbwt(string, lyndonfact, base = 0) {
    var n = string.length;
    var result = new Array(n).fill(2);
    var conjugates = []
    var next_starting_pos = 0;
    lyndonfact[n] = 1;
    for(var i = 0; i <= n; ++i) {
        if(lyndonfact[i] == 1) {
            var conjugate = string.substring(next_starting_pos, i+1);
            for(var conj_it = 0; conj_it < conjugate.length; ++conj_it) {
                conjugates.push(conjugate);
                conjugate = conjugate.substring(1, conjugate.length) + conjugate[0];
            }
            next_starting_pos = i+1;
        }
        if(i == n) { break;}
    }
    conjugates.sort(function omegaOrder(strA, strB) { 
        if(strA.startsWith(strB) || strB.startsWith(strA)) {
            return 0;
        }
        for(var i = 0; ; ++i) {
            if(strA[i % strA.length] < strB[i % strB.length]) { return -1; }
            if(strA[i % strA.length] > strB[i % strB.length]) { return +1; }
        }
    });
    for(var i = 0; i < conjugates.length; ++i) {
        var conjugate = conjugates[i];
        result[i] = conjugate[conjugate.length-1];
        if(result[i] == '\0') { result[i] = '$'; }
    }
    return result;
}

function nssArray(string, isa, base = 0) {
    var n = string.length;
    result = [];
    for(var i = 0; i < n; ++i) {
        var nss = i + 1;
        while (nss < n && isa[nss] > isa[i]) ++nss;
        if (nss >= n) result.push('-');
        else result.push(nss + base);
    }
    return result;
}

function pssArray(string, isa, base = 0) {
    var n = string.length;
    result = [];
    for(var i = 0; i < n; ++i) {
        var pss = i - 1;
        while (pss >= 0 && isa[pss] > isa[i]) --pss;
        if (pss < 0) result.push('-');
        else result.push(pss + base);
    }
    return result;
}


function lyndonArray(string, nssArray, base = 0) {
    var n = string.length;
    result = [];
    for(var i = 0; i < n; ++i) {
        if (nssArray[i] == '-') result.push(n - i);
        else result.push(nssArray[i] - (i + base));
    }
    return result;
}

function lpfArray(string, base = 0) {
    var n = string.length;
    var result = [];
    for(var i = 0; i < n; i++) {
        var maxval = 0;
        var maxarg = 0;
        for(var j = 0; j < i; j++) {
            var lcpval = lcp(string, i, j);
            if(maxval < lcpval) {
                maxval = lcpval;
                maxarg = j;
            }
        }
        result.push(maxval);
    }
    return result;
}
function LZ77Fact(string, base = 0) {
    var n = string.length;
    var lpfarray = lpfArray(string,base);
    var result = new Array(n).fill(0);
    var boundary = 1;
    for(var i = 0; i < n; i++) {
        if(boundary == i) {
            result[i-1] = 1;
            boundary += lpfarray[i] == 0 ? 1 : lpfarray[i];
        }
    }
    return result;
}
function slArray(string, base = 0) {
    var n = string.length;
    var result = new Array(n);
    var type = 'S';
    result[n-1] = type;
    for(var i = n-2; i >= 0; --i) {
        if(string[i+1] > string[i]) {
            type = 'S';
        }
        else if(string[i+1] < string[i]) {
            type = 'L';
            if(result[i+1] == 'S') { result[i+1] = 'S*'; }
        }
        result[i] = type;
    }
    return result;
}



function indexArray(n, base = 0) {
    result = [];
    for(var i = 0; i < n; i++) result.push(i + base);
    return result;
}

function suffixArray(string, base = 0) {
    n = string.length;
    suffixes = [];
    for(var i = 0; i < n; i++)
        suffixes[i] = string.substr(i, n - i);
    suffixes.sort();
    return suffixes.map(function(suffix) {
        return n - suffix.length + base;
    });
}

function rotationArray(string, base = 0) {
    n = string.length;
    ln = ("" + (n + base)).length;
    rotations = [];
    for(var i = 0; i < n; i++)
        rotations[i] = string.substr(i, n - i) + string.substr(0, i) + padLeft("" + (i + base), '0', ln);
    rotations.sort();
    return rotations.map(function(rotation) {
        return parseInt(rotation.substr(n));
    });
}

function inverseSuffixArray(suffixArray, base = 0) {
    result = [];
    for(var i = 0; i < suffixArray.length; i++)
        result[suffixArray[i] - base] = i + base;
    return result;
}

function phiArray(suffixArray, inverseSuffixArray, base = 0) {
    result = [];
    for(var i = 0; i < suffixArray.length; i++)
        if(inverseSuffixArray[i] != base)
            result[i] = suffixArray[inverseSuffixArray[i] - base - 1];
        else
            result[i] = "-";
    return result;
}

function lcp(string, pos1, pos2) {
    result = 0;
    while(string[pos1 + result] == string[pos2 + result])
        result++;
    return result;
}

function lcpArray(string, suffixArray, base = 0) {
    string += '\0';
    var result = [0];
    for(var i = 1; i < suffixArray.length; i++)
        result.push(lcp(string, suffixArray[i] - base, suffixArray[i - 1] - base));
    return result;
}

function plcpArray(inverseSuffixArray, lcpArray, base = 0) {
    var result = [];
    for(var i = 0; i < inverseSuffixArray.length; i++)
        result.push(lcpArray[inverseSuffixArray[i] - base]);
    return result;
}

function psiArray(suffixArray, inverseSuffixArray, base = 0) {
    var result = [];
    for(var i = 0; i < suffixArray.length; i++)
        if(suffixArray[i] - base + 1 < suffixArray.length)
            result.push(inverseSuffixArray[suffixArray[i] - base + 1]);
        else 
            result.push("-");
    return result;
}

function firstRow(string, suffixArray, base = 0) {
    var n = string.length;
    var result = "";
    for(var i = 0; i < n; i++)
        result += string[suffixArray[i] - base];
    return result;
}

function bwt(string, rotationArray, base = 0) {
    var n = string.length;
    var result = "";
    for(var i = 0; i < n; i++)
        result += string[(rotationArray[i] - base + n - 1) % n];
    return result;
}

function lfArray(suffixArray, inverseSuffixArray, base = 0) {
    var n = suffixArray.length;
    var result = [];
    for(var i = 0; i < n; i++) {
        var sa = (suffixArray[i] - base + n - 1) % n;
        result[i] = inverseSuffixArray[sa];
    }
    return result;
}

function padRight(str, char, len) {
    while(str.length < len) str += char;
    return str;
}

function padLeft(str, char, len) {
    while(str.length < len) str = char + str;
    return str;
}

function arrayToString(array, sep = " ", base = 0) {
    var width = ("" + (array.length + base - 1).toString()).length
    var result = "";
    for(var i = 0; i < array.length - 1; i++) 
        result += padLeft("" + array[i], ' ', width) + sep;
    result += padLeft("" + array[array.length - 1], ' ', width);
    return result;
}

function stringToString(string, sep = " ", base = 0) {
    string = string.replace("\0", "$");
    var width = ("" + (string.length + base - 1).toString()).length
    var result = "";
    for(var i = 0; i < string.length - 1; i++) 
        result += padLeft("" + string[i], ' ', width) + sep;
    result += padLeft("" + string[string.length - 1], ' ', width);
    return result;
}
