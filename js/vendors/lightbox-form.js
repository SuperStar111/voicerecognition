/*
 *  @modified juniorionut @ elance
 *  @version $Id: layout.js , v 1.0 9:11 AM 9/29/2014 juni $
 *  -> [REQ_021 - 2014-09-29]
 ->  Weekly Project 2
 -> Code indent
 -> 2014-10-01 -> logging at different levels
 */

/**
 * gradient
 */
function gradient(id, level) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - gradient');
    var box = document.getElementById(id);
    box.style.opacity = level;
    box.style.MozOpacity = level;
    box.style.KhtmlOpacity = level;
    box.style.filter = "alpha(opacity=" + level * 100 + ")";
    box.style.display = "block";
    return;
}//gradient

/**
 * fadein
 */
function fadein(id) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - fadein');
    var level = 0;
    while (level <= 1) {
        setTimeout("gradient('" + id + "'," + level + ")", (level * 1000) + 10);
        level += 0.01;
    }
}//fadein

var video = '';
var canvas = '';
var ctx = '';
var localMediaStream = null;



var criouwebcam = false;
/**
 * openbox
 */
// Open the lightbox submit punch
function openbox(formtitle, fadin) {
//    if (isDebugFinest())
//        console.log('lightbox-form -  init() - openbox');
    if ((lastpagao != 'wrapper1') && (lastpagao != 'wrapper2')) {
        var url = transformurl(GLOBAL_url + 'api2/Attendance/checkpunch.php?conf=1&location_id=' + global_locid + '&emp_id=' + global_empid + '&uniq_param=' + (new Date()).getTime());
        console.log(url);
        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            success: function (data) {
                console.log(data);

                if ((ahjkssaaasdsaewq == 'in') && (typeof data.has_open_orders != 'undefined')) {//juni -> 2014-12-10 -> 06 - POS - TimePoint - Dec 8 - CJ01.jpg -> do not allow logout if the user has opened checks
                    showmessage("You currently have " + data.no_of_orders + " opened checks. Please close all of your checks before Punching Out.");
                } else {
                    if (data == 9) {
                        showmessage("You have already punched within 5 min");
                    } else {

                        if (hasGetUserMedia()) {

                            if (criouwebcam === false) {
                                criouwebcam = true;
                                var ss = '<video autoplay id="vid" style="width:350px;height:460px;position:relative;left:62px;top:-100px"  ></video>' +
                                        '<canvas id="canvas2" width="640" height="480" style="border:1px solid #d3d3d3;position:relative;left:60px;display:none"></canvas>';

                                $("#webcam").html(ss);

                                setTimeout(function () {
                                    video = document.querySelector("#vid");
                                    canvas = document.querySelector('#canvas2');
                                    ctx = canvas.getContext('2d');
                                    localMediaStream = null;

                                    var onCameraFail = function (e) {
                                        console.log('Camera did not work.', e);
                                    };


                                    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                                    window.URL = window.URL || window.webkitURL;
                                    navigator.getUserMedia({video: true}, function (stream) {
                                        video.src = window.URL.createObjectURL(stream);
                                        localMediaStream = stream;
                                    }, onCameraFail);
                                }, 1000);
                            }
                        }
                        //
                        //
                        //
                        var box = document.getElementById('box');
                        document.getElementById('shadowing').style.display = 'block';
                        var btitle = document.getElementById('boxtitle');
                        btitle.innerHTML = formtitle;
                        if (fadin) {
                            gradient("box", 0);
                            fadein("box");
                        } else {
                            box.style.display = 'block';
                        }

                    }
                }
            }
        });
    }
}//openbox


function snapshot() {
    if (localMediaStream) {
        ctx.drawImage(video, 0, 0);
    }
}


/**
 * openbox2 - Open the lightbox punch in
 */
function openbox2(formtitle2, fadin, imgno) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox2');
    var box2 = document.getElementById('box2');
    document.getElementById('shadowing2').style.display = 'block';
    //document.getElementById('user_photo').src=imgno;
    var btitle2 = document.getElementById('boxtitle2');
    btitle2.innerHTML = formtitle2;
    if (imgno != '') {
        var imgPreloader = new Image();
        imgPreloader.onload = (function () {
            $("#user_photo").attr("src", imgno);
            var maxWidth = 340; // Max width for the image
            var maxHeight = 300; // Max height for the image
            var ratio = 1; // Used for aspect ratio

            var width = $('#user_photo').width(); // Current image width
            var height = $('#user_photo').height(); // Current image height
            // Check if the current width is larger than the max
            if (width > maxWidth) {
                ratio = maxWidth / width; // get ratio for scaling image
                $('#user_photo').css("width", maxWidth); // Set new width
                $('#user_photo').css("height", height * ratio); // Scale height based on ratio
                height = height * ratio; // Reset height to match scaled image
                width = width * ratio; // Reset width to match scaled image
            }
            // Check if current height is larger than max
            if (height > maxHeight) {
                ratio = maxHeight / height; // get ratio for scaling image
                $('#user_photo').css("height", maxHeight); // Set new height
                $('#user_photo').css("width", width * ratio); // Scale width based on ratio
                width = width * ratio; // Reset width to match scaled image
            }

        });
        imgPreloader.src = imgno;
    }
    if (fadin) {
        gradient("box2", 0);
        fadein("box2");
    } else {
        box2.style.display = 'block';
    }
}//openbox2


/**
 * openbox3 - Open the lightbox logout
 */
function openbox3(formtitle3, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox3');
    $("#logout_password").val("");
    var box3 = document.getElementById('box3');
    document.getElementById('shadowing3').style.display = 'block';
    var btitle3 = document.getElementById('boxtitle3');
    btitle3.innerHTML = formtitle3;

    if (fadin) {
        gradient("box3", 0);
        fadein("box3");
    } else {
        box3.style.display = 'block';
    }
    $("#logout_password").focus();
}//openbox3

/**
 * openbox9 - Open the lightbox logout
 */
function openbox9(formtitle3, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox9');
    //-> juni - URGENT pos - nov 03 - ip03.jpg -> do not allow adding items to order if server is different
    //column in db: pos_update_other_server -> global_update_other_server = data.update_other_server;
    $("#searchfldscnd").val("");
    var orderEmp = $('#srvr').val();

    if (isDebugFine())
        console.log('menuandorder - submititens() - global_empid:#', global_empid, ', #geralzaoid:#', geralzaoid, ', #global_update_other_server:#', global_update_other_server);
    if (geralzaoid != orderEmp && global_update_other_server == 'no') {
        jAlert('Access Denied!', 'Alert Dialog');
        return false;
    }
    //<- juni - URGENT pos - nov 03 - ip03.jpg	
    var box3 = document.getElementById('box9');
    document.getElementById('shadowing9').style.display = 'block';

    var btitle3 = document.getElementById('boxtitle9');
    btitle3.innerHTML = formtitle3;
    $("#menu").click();
    $("#menuview").click();
    if (fadin) {
        gradient("box9", 0);
        fadein("box9");
    } else {
        box3.style.display = 'block';
    }
}//openbox9

/**
 *openbox4  - Open the lightbox logout
 */
function openbox4(formtitle3, fadin) {
    //getFilterdate();

    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox4');
    document.getElementById('identifier').value = $(".searchfldcklpg").val();
    var box3 = document.getElementById('box4');
    document.getElementById('shadowing4').style.display = 'block';
    var btitle3 = document.getElementById('boxtitle4');
    btitle3.innerHTML = formtitle3;
    if (fadin) {
        gradient("box4", 0);
        fadein("box4");
    } else {
        box3.style.display = 'block';
    }
    $("#shadowing4").css({
        "z-index": "9999999999"
    });
    $("#box4").css({
        "z-index": "99999999999"
    });

    $(".equallycoverscb").css({
        "z-index": "0"
    });

}//openbox4

/**
 * openbox15 -  Open the lightbox discount pop'up
 */
function openbox15(formtitle3, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox15');
    var box3 = document.getElementById('box15');
    document.getElementById('shadowing15').style.display = 'block';
    var btitle3 = document.getElementById('boxtitle15');
    btitle3.innerHTML = formtitle3;
    document.getElementById('vl_discount').focus();
    if (fadin) {
        gradient("box15", 0);
        fadein("box15");
    } else {
        $("#vl_discount_amount").val('');
        box3.style.display = 'block';
    }
}//openbox15

/**
 * openbox12 -  Open the lightbox discount pop'up
 */
function openbox12(formtitle3, fadin) {
    clearnewitemart();
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox15');
    var box3 = document.getElementById('box12');
    document.getElementById('shadowing12').style.display = 'block';
    var btitle3 = document.getElementById('boxtitle12');
    btitle3.innerHTML = formtitle3;
    if (fadin) {
        gradient("box12", 0);
        fadein("box12");
    } else {
        box3.style.display = 'block';
    }
}//openbox15

/**
 *openbox14 - Open the lightbox pinpad
 */
function openbox14(formtitle3, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox14');
    var box3 = document.getElementById('box14');
    document.getElementById('shadowing14').style.display = 'block';
    var btitle3 = document.getElementById('boxtitle14');
    btitle3.innerHTML = formtitle3;
    $('#emp_password2').val('');//juni - 2014-10-25 - POS - Oct 20 - CJ07.jpg -> do not keep password
    if (fadin) {
        gradient("box14", 0);
        fadein("box14");
    } else {
        box3.style.display = 'block';
    }
    document.getElementById('emp_password2').focus();
}//openbox14


/**
 * openbox11 - Open the lightbox logout
 */
var tittsfsadda = '';
function openbox11(formtitle3, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox11');
    tittsfsadda = formtitle3;
    var topping_extra = global_free_toppings;
    if ((topping_extra != null) && (topping_extra > 0)) {
        topping_extra = topping_extra + ' Toppings included';
    } else {
        topping_extra = ' No Toppings included';
    }
    formtitle3 = formtitle3 + ' - ' + topping_extra;
    var box3 = document.getElementById('box11');
    document.getElementById('shadowing11').style.display = 'block';
    var btitle3 = document.getElementById('boxtitle11');
    btitle3.innerHTML = formtitle3;
    if (fadin) {
        gradient("box11", 0);
        fadein("box11");
    } else {
        box3.style.display = 'block';
    }
}//openbox11

/**
 *opendrawer
 */
/**moved to terminal.js*/
/* 
 var global_dw_type = "No sale";
 var global_dw_order_id = "";
 var global_dw_cash_received = "";
 var global_dw_terminal_id = "";
 function opendrawer() {
 if (isDebugFinest()) console.log('lightbox-form -  init() - opendrawer');
 if (global_cash_access == 'yes') {
 global_empid = $("#employee_id").val();
 var location_id = $("#location_id").val();
 global_dw_terminal_id = "";
 var url = transformurl(GLOBAL_url + "api/opendrawer.php?open_type=" + global_dw_type + "&location_id=" + location_id + "&order_id=" + global_check_num + "&cash_received=" + global_dw_cash_received +"&local_ip="+global_local_ip+"&open_by=" + global_empid + "&open_on=POSPoint Browser&terminal_id=" + global_terminal_id);
 //   
 $.getJSON(url, function(data) {
 if (isDebugFine()) console.log('lightbox-form -  opendrawer() - data:#',data);
 global_dw_type = "No sale";
 global_dw_order_id = "";
 global_dw_cash_received = "";
 stoppreload();
 });
 
 
 global_dw_type = "No sale";
 global_dw_order_id = "";
 global_dw_cash_received = "";
 } else {
 showmessage('Access denied');
 }
 }//opendrawer
 */
/**
 * calculateweight
 */
function calculateweight() {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - calculateweight');
    if ($("#vl_weight").val() < 0) {
        $("#vl_weight").val("");
    }


    if ($("#vl_weight_ounce").val() < 0) {
        $("#vl_weight_ounce").val("");
    }
    var b = $("#vl_weight").val();
    var f = $("#vl_weight_ounce").val();

    var ggs = 0;
    f = parseFloat(f);
    if (parseFloat(f) >= 0.01) {
        ggs = parseFloat(f / 16);
    }
    if (isNaN(parseFloat(b))) {
        b = parseFloat(ggs);
    } else {
        b = parseFloat(b) + parseFloat(ggs);
    }
    var tot = global_price_weight * b;

    if (isNaN(tot)) {
        tot = 0;
    } else if (tot < 0) {
        $("#vl_weight").val("");
        showmessage('Please insert a valid weight');
        tot = 0;
    }
    tot = tot.toFixed(2);
    tot = formatmoney(tot, 1);
    $("#totalweight").html(tot);
}//calculateweight

/**
 * confirmweight
 */
function confirmweight() {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - confirmweight');
    var b = $("#vl_weight").val();
    var f = $("#vl_weight_ounce").val();

    var ggs = 0;
    f = parseFloat(f);
    if (parseFloat(f) >= 0.01) {
        ggs = parseFloat(f / 16);
    }
    if (isNaN(parseFloat(b))) {
        b = parseFloat(ggs);
    } else {
        b = parseFloat(b) + parseFloat(ggs);
    }

    var tot = global_price_weight * b;

    if (isNaN(tot)) {
        tot = 0;
    }
    //if (tot < 0) {
    if (tot <= 0) {//juni - 2014-11-20 - POS - Nov 18 - CJ05.jpg -in order to prevent errors prevent quantities with 0
        showmessage('Please insert a valid Weight.');
    } else if (tot > 0) {
        tot = tot.toFixed(2);
        //
        var f = 0;
        if (global_editing_mdf == 0) {
            f = arraydeitemstosend.length - 1;
        } else {
            f = global_edit_item;
        }
        global_edit_item = "";
        globals_editing = false;
        arraydeitemstosend[f].weight = b;
        arraydeitemstosend[f].weight_price = tot;
        if (isDebugFinest())
            console.log('lightbox-form -  confirmweight() - arraydeitemstosend:#', arraydeitemstosend);
        stoppreload();
        closebox();
        setTimeout(function () {
            loaditemsadded();
            if (global_pos_require_seat == 'yes') {
                setTimeout(function () {
                    var sgsf = arraydeitemstosend.length - 1;
                    selitemadded('checkbox1item-' + arraydeitemstosend[sgsf].item_id + '-' + arraydeitemstosend[sgsf].itemposition, 'checkbox1itema-' + arraydeitemstosend[sgsf].item_id + '-' + arraydeitemstosend[sgsf].itemposition);
                    if ((arraydeitemstosend[sgsf].seat == '') || (arraydeitemstosend[sgsf].seat == '99')) {
                        defgghssw = defgghssw.split(' ');
                        defgghssw = defgghssw[defgghssw.length - 1];
                        if (defgghssw != '1') {
                            stpg = false;
                            openseat();
                        }
                    }
                }, 500);
            }
        }, 500);

        ///
    }
}//confirmweight

/**
 *openboxweight
 */
function openboxweight(formtitle3, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openboxweight');
    $("#totalweight").html("&nbsp");
    $("#vl_weight").val("");
    var box3 = document.getElementById('boxweight');
    document.getElementById('shadowingweight').style.display = 'block';

    var btitle3 = document.getElementById('boxtitleweight');
    btitle3.innerHTML = formtitle3;

    if (fadin) {
        gradient("boxweight", 0);
        fadein("boxweight");
    } else {
        box3.style.display = 'block';
    }
}//openboxweight

/**
 * openbox7 - Open the lightbox logout
 */
function openbox7(formtitle3, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox7');
    if (formtitle3 != 'Change due') {
        opendrawer();
    }
    var box3 = document.getElementById('box7');
    document.getElementById('shadowing7').style.display = 'block';

    var btitle3 = document.getElementById('boxtitle7');
    btitle3.innerHTML = formtitle3;

    if (fadin) {
        gradient("box7", 0);
        fadein("box7");
    } else {
        box3.style.display = 'block';
    }
}//openbox7



/**
 *openbox10 - Open the lightbox logout
 */
function openbox10(formtitle3, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox10');
    var box3 = document.getElementById('box10');
    document.getElementById('shadowing10').style.display = 'block';

    var btitle3 = document.getElementById('boxtitle10');
    btitle3.innerHTML = formtitle3;

    if (fadin) {
        gradient("box10", 0);
        fadein("box10");
    } else {
        box3.style.display = 'block';
    }
}//openbox10

/**
 * openbox5 - Open the lightbox logout
 */
function openbox5_original(formtitle3, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox5_original');
    if (document.getElementById('box8').style.display != 'block') {
        var box3 = document.getElementById('box5');
        document.getElementById('shadowing5').style.display = 'block';

        var btitle3 = document.getElementById('boxtitle5');
        btitle3.innerHTML = formtitle3;

        if (fadin) {
            gradient("box5", 0);
            fadein("box5");
        } else {
            box3.style.display = 'block';
        }

        var sgs = '';
        if (arraydeitemstosend.length > 0) {
            sgs = arraydeitemstosend[0].seat;
        } else if (globa_array_items_selected_ordered.length > 0) {
            //
            var iditem = globa_array_items_selected_ordered[0].id;
            var itemposition = globa_array_items_selected_ordered[0].itemposition;
            var s = globa_array_items_selected_ordered[a];
            for (var j = 0; j < defarrayzaoprodord.length; j++) {
                var val = defarrayzaoprodord[j];
                if ((val.id == s)) {

                    sgs = val.seat_payment;
                }
            }
        }

        mounttable(global_tablesel, covers);

        //->juni [req REQ_021] - 2014-10-02 - POS GUI - Sep 28 - CJ03.jpg -> selected seat number should be black

        setTimeout(function () {
            var sg = sgs.split(",");
            for (var i = 0; i < sg.length; i++) {

                $("#im-gtable" + sg[i]).css({
                    opacity: 1
                });
            }

        }, 500);

        //<-juni [req REQ_021] - 2014-10-02 - POS GUI - Sep 28 - CJ03.jpg -> selected seat number should be black		
    }
}
/**
 * openbox5 - Open the lightbox logout
 */
function openbox5(formtitle3, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox5');
    if (document.getElementById('box8').style.display != 'block') {
        var box3 = document.getElementById('box5');
        document.getElementById('shadowing5').style.display = 'block';
        var btitle3 = document.getElementById('boxtitle5');
        btitle3.innerHTML = formtitle3;
        if (fadin) {
            gradient("box5", 0);
            fadein("box5");
        } else {
            box3.style.display = 'block';
        }
        var sgs = '';
        //->juni [req REQ_021] - 2014-10-02 - POS GUI - Sep 28 - CJ03.jpg -> selected seat number should be black
        //swaped if/else if to check all elements selected -> old functions
        /*   if (arraydeitemstosend.length > 0) {
         sgs = arraydeitemstosend[0].seat;
         } else if (globa_array_items_selected_ordered.length > 0) {
         //
         var iditem = globa_array_items_selected_ordered[0].id;
         var itemposition = globa_array_items_selected_ordered[0].itemposition;
         var s = globa_array_items_selected_ordered[a];
         for (var j = 0; j < defarrayzaoprodord.length; j++) {
         var val = defarrayzaoprodord[j];
         if ((val.id == s)) {
         
         sgs = val.seat_payment;
         }
         }
         }
         mounttable(global_tablesel, covers);
         setTimeout(function() {
         $(".im-gtable").css({
         "opacity": 0.5
         });
         $("#im-gtable" + sgs).css({
         opacity: 1
         }); 
         }, 300);
         */
        var seats = new Array();
        //if i have empty array, i must get the selected items -> this works for items that are already ordered
        if (globa_array_items_selected_ordered.length < 1) {
            globa_array_items_selected_ordered = new Array();
            var k = 0;
            $("#ordereditems2 input:checkbox[name=checkboxitemsordered]:checked").each(function () {
                //console.log('ordereditems2',this);
                globa_array_items_selected_ordered[k] = $(this).val();
                k++;
            });
        }
        //console.log('00globa_array_items_selected_ordered:',globa_array_items_selected_ordered);
        if (globa_array_items_selected_ordered.length > 0) {
            for (var k = 0; k < globa_array_items_selected_ordered.length; k++) {
                var s = globa_array_items_selected_ordered[k];
                for (var j = 0; j < defarrayzaoprodord.length; j++) {
                    var val = defarrayzaoprodord[j];
                    if ((val.id == s)) {
                        seats[k] = val.seat_payment;
                        if (seats[k] == 99) {//if all, no need to continue
                            sgs = 99;
                            break;
                        }
                    }
                }
            }
        } else if (arraydeitemstosend.length > 0) { //if the items are not ordered, i need to iterate over the items to send
            for (var i = 0; i < arraydeitemstosend.length; i++) {
                var cItem = arraydeitemstosend[i];
                //example in dom: <input type="checkbox" value="8045-2" class="checkbox1item-8045-2" name="checkboxitemsadded" id="checkbox1item-8045-2">
                var isChecked = $('#tableofitems4 input:checkbox[id=checkbox1item-' + cItem.item_id + '-' + cItem.itemposition + ']').is(':checked');
                if (isChecked == true) {
                    if (cItem.seat == 99) {//if all, no need to continue
                        sgs = 99;
                        break;
                    } else {
                        if (cItem.seat != '')//prevent empty seats
                            seats.push(cItem.seat);
                    }
                }
                //sgs = arraydeitemstosend[0].seat;
            }
        }
        mounttable(global_tablesel, covers);
        if (isDebugFine())
            console.log('lightbox-form - selecting seats() - sgs:#', sgs, ', #seats:#', seats, ', #arraydeitemstosend:#', arraydeitemstosend);
        setTimeout(function () {
            $(".im-gtable").css({
                "opacity": 0.5
            });
        }, 300);
        if (sgs == 99) {//if all, nothing else should be selected
            setTimeout(function () {
                $("#im-gtable99").css({
                    opacity: 1
                });
            }, 500);
        } else if (seats.length > 0) { //select each seat and make all fade
            setTimeout(function () {
                $("#im-gtable99").css({
                    opacity: 0.5
                });
                var g = seats.toString();
                var stem = g.split(",");
                globalarrayseats = stem;
                setTimeout(function () {

                    globalarrayseats = stem;
                }, 1000);
                setTimeout(function () {

                    globalarrayseats = stem;
                }, 3000);

                for (var i = 0; i < stem.length; i++) {

                    $("#im-gtable" + stem[i]).css({
                        opacity: 1
                    });
                }
            }, 500);
        } else if (sgs > 0 && sgs < 99) { //if i have a single seat selected, select that
            setTimeout(function () {
                $("#im-gtable99").css({
                    opacity: 0.5
                });
                $("#im-gtable" + sgs).css({
                    opacity: 1
                });
            }, 500);
        } else { //select all
            if (globalAllowMultipleSeats == false) {//juni ->  2014-12-15 - 03 - POS - Dec 13 - CJ01 - need to be able to select multiple seats
                setTimeout(function () {
                    $("#im-gtable99").css({
                        opacity: 1
                    });
                }, 500);
            }
        }
        //<-juni [req REQ_021] - 2014-10-02		
    }
}//openbox5



/**
 * openbox6761 - Open the lightbox logout
 */
function openbox6761(formtitle3, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox6761');
    var box3 = document.getElementById('box6761');
    document.getElementById('shadowing6761').style.display = 'block';

    var btitle3 = document.getElementById('boxtitle6761');
    btitle3.innerHTML = formtitle3;

    if (fadin) {
        gradient("box6761", 0);
        fadein("box6761");
    } else {
        box3.style.display = 'block';
    }
}//openbox6761


/**
 * openbox6 - Open the lightbox logout
 */
function openbox6(formtitle3, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openbox6');
    var vsgsf = adminautho;
    if (vsgsf == false) {
        vsgsf = trychange('Add A Client');
    }
    if (vsgsf) {
        if (va_global_order == 'closedsss') {
            showmessage('Order Already Closed');
        } else {
            var box3 = document.getElementById('box6');
            document.getElementById('shadowing6').style.display = 'block';

            var btitle3 = document.getElementById('boxtitle6');
            btitle3.innerHTML = formtitle3;

            if (fadin) {
                gradient("box6", 0);
                fadein("box6");
            } else {
                box3.style.display = 'block';
            }
        }
    }

}//openbox6


//juni -> 2014-11-12 -> POS - Oct 19 - CJ23.jpg -> grey out attendance if access_timeattendance
/**
 * openBoxTimeAttendance - Open the time attendance alert box that will send mail to admins. 
 * This is set in openpage() function when access_timeattendance='no' for the location (and we click on schedule" button
 */
function openBoxTimeAttendanceError(formtitle3, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openBoxTimeAttendance');
    var strLocationID = $("#location_id").val();
    var strCEmpID = $("#employee_id").val();
    //console.log("strLocationID:",strLocationID,"strCEmpID:",strCEmpID);
    jConfirm("Would you like to learn more about TimePoint in order to better manage your business? Press OK and a SoftPoint Representative will contact you shortly.", "Notice", function (r) {
        if (r) {
            jConfirm("A SoftPoint Representative will contact you within 48 hours. Thanks!", "Notice", function (r) {
                if (r) {
                    $.ajax({
                        url: 'api/emailAdmin.php',
                        data: {location_id: strLocationID, employee_id: strCEmpID, product: 'Attendance & Scheduling'},
                        type: 'POST',
                        success: function (data) {
                            stoppreload();
                            closebox();
                        }
                    });
                }
            });
            $('#popup_cancel').hide();
            $('#popup_ok').val('OK');
        }
    });
    $('#popup_cancel').val('Cancel');
    $('#popup_ok').val('OK');
}//openBoxTimeAttendance


//juni -> 2014-11-23 - POS - Reports - 02.jpg
/**
 * openboxFilterReports - Open the filter report box. 
 */
function openboxFilterReports(boxTitle, fadin) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openboxFilterReports');
    var box = document.getElementById('boxReportFilter');
    document.getElementById('shadowingReportFilter').style.display = 'block';
    var title = document.getElementById('boxReportFilterTitle');
    title.innerHTML = boxTitle;
    if (fadin) {
        gradient("boxReportFilter", 0);
        fadein("boxReportFilter");
    } else {
        box.style.display = 'block';
    }
}//openboxFilterReports

//juni -> 2014-12-07 - POS - Dec 6 14 - ND01.jpg
/**
 * checkClientOpenBox - check if the client exists, if it does open the pop'up, otherwise add it
 */
var tempSearchValue = "";//prevent searching for same item
function checkClientOpenBox(boxTitle, fadin, value) {
    //alert(value);
    if (isDebugFinest())
        console.log('lightbox-form -  init() - checkClientOpenBox');
    if (!jIsEmpty(value)) {
        /*if (tempSearchValue!=value)
         tempSearchValue = value;
         else //prevent searching for same item
         return false;*/
        var vahh = '';
        /* 		if (fadin == 99){
         vahh='99999111919191';		
         var s = $('#tab_client_phone').val() 
         $('#client_phone').val(s) ;
         } */
        //var urll=transformurl(GLOBAL_url+"api2/find_clients.php?search="+value+vahh+"&a=1&inactive=1");
        var urll = transformurl(GLOBAL_url + "api2/find_clients.php?search=" + value + "&a=1&inactive=1");
        if (isDebugFine())
            console.log('lightbox-form. - checkClientOpenBox() urll - :#', urll);
        $.getJSON(urll, {
            format: "json"
        },
        function (data) {
            data = data.cli;
            arraydefclissg = data;
            if (data.length > 0 && fadin != 99) {
                openbox6('Add A Client', 0);
                $('#searchfldaddclient').val(value);
                $('#searchfldaddclient').keyup();
            } else {
                var clientName = $('#client_name').val();
                var clientPhone = $('#client_phone').val();
                if (((vtabao == 'parceltab') || (vtabao == 'parceltab')) && (clientName.length == 0 || clientPhone.length == 0)) {
                    return false;
                } else {
                    //jConfirm("Could not find client. Do you want to add it?", "Confirm action", function(r) {
                    //	if (r) {
                    if (true) {
                        //original
                        /* var clientName = $('#client_name').val();
                         var clientPhone = $('#client_phone').val();
                         clearclients();openpage('wrapper10'); closebox();
                         setTimeout(function(){
                         $('#firstname').val(clientName);
                         $('#phonenumber').val(clientPhone);
                         },500); */
                        //try 2
                        /* 	var clientName = $('#client_name').val();
                         var clientPhone = $('#client_phone').val();
                         clearclients();openpage('wrapper10'); closebox();
                         setTimeout(function(){
                         $('#firstname').val(clientName);
                         $('#phonenumber').val(clientPhone);
                         saveclient();
                         },500);
                         setTimeout(function(){
                         addclientinfo(0, '', $('#client_name').val(), '', $('#client_phone').val(), '', '');
                         },1000); */
                        var client_id = 0;
                        var urll = transformurl(GLOBAL_url + "api2/client.php?returnid=1&created_on=POSPoint Browser&name=" + clientName + "&name_first=" + clientName + "&name_last=" + '' + "&phone=" + clientPhone + "&name_suffix=" + '' + "&name_title=" + '' + "&sex=" + '' + "&dob=" + '' + "&smoker=" + '' + "&handicap=" + '' + "&client_id=" + '' + "&email=" + '' + "&status=A");
                        $.getJSON(urll, {
                            format: "json"
                        },
                        function (data) {
                            if (!jIsEmpty(data)) {
                                data = data + "";
                                data = data.replace("[", "").replace("]", "");
                            }
                            if (isDebugFine())
                                console.log('client - checkClientOpenBox() data:#', data);
                            //gclicli=data;
                            if (data > 1 && isNumber(data)) {
                                global_clientsel = data;
                            } else {
                                var urll = transformurl(GLOBAL_url + "api2/find_clients.php?search=" + clientName + "&a=1&inactive=1");
                                if (isDebugFine())
                                    console.log('client - saveclient() urll - :#', urll);
                                $.getJSON(urll, {
                                    format: "json"
                                },
                                function (data) {
                                    data = data.cli;
                                    $.each(data, function (key, val) {
                                        arraydefclissg = data;
                                    });
                                    global_clientsel = data[0].id;//
                                });
                            }
                            stoppreload();
                            addclientinfo(global_clientsel, '', clientName, '', clientPhone, '', '');
                            $('#client_name').val(clientName);
                            $('#client_phone').val(clientPhone);
                            /* 									setTimeout(function(){
                             var urll=transformurl(GLOBAL_url+"api2/find_clients.php?search="+name+"&a=1&inactive=1");
                             if (isDebugFine()) console.log('client - saveclient() urll - :#',urll); 
                             $.getJSON(urll,{
                             format: "json"
                             },
                             function(data) { 
                             data=data.cli; 		
                             $.each(data, function(key, val) {
                             arraydefclissg=data; 
                             });
                             if (client_id==0 && data[0]!='') //juni -> 2014-11-25 - POS - Nov 25 - SC04.jpg -> cannot open client afer just adding it
                             client_id = data[0].id;	
                             addclientinfo(client_id, '' , clientName, '', clientPhone, '', '');
                             $('#client_name').val(clientName) ;
                             $('#client_phone').val(clientPhone) ;	
                             });			
                             },1000); */
                            showmessage('Client updated successfully');
                        });
                    } else
                        ;//
                    //	});
                }
            }
        });
    } else
        ;
}//checkClientOpenBox


/**
 * openboxModifierExtra - Open the extra price for modifier when clickin on "extra button"
 //juni -> 2014-12-08 - 02 - POS Modifer Global - Dec 04 - CR01.jpg
 */
function openboxModifierExtra(boxTitle, fadin, id, price) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openboxModifierExtra');
    var box = document.getElementById('boxModifierExtra');
    document.getElementById('shadowingModifierExtra').style.display = 'block';
    var title = document.getElementById('boxModifierExtraTitle');
    document.getElementById('shadowingModifierExtra').onclick = null;
    title.innerHTML = boxTitle;
    $('#extraPrice').val(price);
    $('#btnModifierExtraSubmit').attr('onclick', "addMdfFromExtra('" + id + "' ,this,82,'XTRA');closeExtraModifierBox();");
    if (fadin) {
        gradient("boxModifierExtra", 0);
        fadein("boxModifierExtra");
    } else {
        box.style.display = 'block';
    }
    $('#extraPrice').focus();
}//openboxModifierExtra



/**
 * Close the Extra Modifier Box
 //juni -> 2014-12-08 - 02 - POS Modifer Global - Dec 04 - CR01.jpg
 */
function closeExtraModifierBox() {
    $('#boxModifierExtra, #shadowingModifierExtra').hide();
}//closeExtraModifierBox

/**
 * Enter extra modifier price
 */
function calcExtraModifierPrice() {
    var sg = $("#extraPrice").val();
    gsh = sg.split(".");
    if (gsh.length > 1) {
        if (parseFloat(gsh[gsh.length - 1]) > 99) {
            $("#extraPrice").val("");
        }
    }
    /* 	if (ckv($("#extraPrice").val()) > 1000) {
     $("#extraPrice").val('');
     } */
}//calcExtraModifierPrice

/**
 *
 */
function insertprint() {


}


/**
 * Close the lightbox
 */
function closebox() {
    $(".equallycoverscb").css({
        "z-index": "99999999999"
    });
    //$("#client_name").val(''); //whyy?
    $("#searchfldaddclient").val('');
    if (isDebugFinest())
        console.log('lightbox-form -  init() - closebox');
    //juni [req REQ_023] - 2014-10-11 - POS - Keyboard - Aug 19 - CJ02.jpg -> add keyboard in other windows  -> 
    //POS - Oct 14 - IP02.jpg -> remove keyboard on any close of pop'ups
    //console.log("aaaaa",$('.input_login').getkeyboard());
    //TODO:
    // if ($.isFunction($('.input_login').getkeyboard)) {
    // console.log("isfunc");
    // if ($('.input_login').getkeyboard().isVisible())
    // $('.input_login').getkeyboard().close();
    // } else {
    // console.log("NOfunc");
    // }
    // $("#v_listclient").html("");
    if ((lastpagao == 'wrapper8' || lastpagao == 'wrapper9') && employee_access_needed == 'allow_merge') { // juni [req REQ_023] - 2014-10-21 - POS - Oct 20 - CJ08.jpg - reload orders in case password manager is closed
        employee_access_needed = '';//to be sure is not called twice
        refreshhome();
    }
    global_require_temperature = false;
    if (lastpagao == 'wrapper2') {
        $("#emp_password").focus();
    }
    $("#v_listclient").html("");
    document.getElementById('searchfldaddclient').value = "";
    document.getElementById('box').style.display = 'none';
    document.getElementById('shadowing').style.display = 'none';
    document.getElementById('boxweight').style.display = 'none';
    document.getElementById('shadowingweight').style.display = 'none';
    document.getElementById('box6761').style.display = 'none';
    document.getElementById('shadowing6761').style.display = 'none';
    document.getElementById('box2').style.display = 'none';
    document.getElementById('shadowing2').style.display = 'none';
    document.getElementById('box3').style.display = 'none';
    document.getElementById('shadowing3').style.display = 'none';
    document.getElementById('box8').style.display = 'none';
    document.getElementById('shadowing8').style.display = 'none';
    document.getElementById('box6').style.display = 'none';
    document.getElementById('shadowing6').style.display = 'none';
    document.getElementById('box5').style.display = 'none';
    document.getElementById('shadowing5').style.display = 'none';
    document.getElementById('box10').style.display = 'none';
    document.getElementById('shadowing10').style.display = 'none';
    document.getElementById('box7').style.display = 'none';
    document.getElementById('shadowing7').style.display = 'none';
    document.getElementById('box4').style.display = 'none';
    document.getElementById('shadowing4').style.display = 'none';
    document.getElementById('box9').style.display = 'none';
    document.getElementById('shadowing9').style.display = 'none';
    document.getElementById('box14').style.display = 'none';
    document.getElementById('shadowing14').style.display = 'none';
    document.getElementById('box11').style.display = 'none';
    document.getElementById('shadowing11').style.display = 'none';
    document.getElementById('box12').style.display = 'none';
    document.getElementById('shadowing12').style.display = 'none';
    document.getElementById('box15').style.display = 'none';
    document.getElementById('shadowing15').style.display = 'none';
    $(".nosale").html("No Sale");
    document.getElementById('user_photo').src = "images/photo.png";
    document.getElementById('searchfldmodfi').value = "";
    //juni -> 2014-11-23 - POS - Reports - 02.jpg
    document.getElementById('boxReportFilter').style.display = 'none';
    document.getElementById('shadowingReportFilter').style.display = 'none';
    document.getElementById('boxReportPrint').style.display = 'none';
    //juni -> 2014-12-08 - 02 - POS Modifer Global - Dec 04 - CR01.jpg
    if (document.getElementById('lightbox-webcam-payment') != null) {
        document.getElementById('lightbox-webcam-payment').style.display = 'none';
    }

    $('#boxModifierExtra, #shadowingModifierExtra').hide();
    //
    setTimeout(function () {
        $("#special_requestforitem").val("");
    }, 1000);
    wasItemSubmitted = false; //->juni [req REQ_021] - 2014-09-30 - prevent multiple click on an item that needs a seat
}//closebox
//$(document).ready(closebox);

function openWebcamBox(id, formtitle, fadein) {
    if (isDebugFinest())
        console.log('lightbox-form -  init() - openwebcambox');

    var box = $(id).closest('#box');
    $(box).show();
    var box_holder = $(box).closest('section:not("#box")');
    $(box_holder).show();

    var title = $(box).find('#boxtitle');
    $(title).text(formtitle);

    var shadowing = $(box_holder).find('#shadowing');
    $(shadowing).show();
}

/* Functions added by DB for employee attendance */
//function employee_open_punch_box(formtitle, fadin, $http, $modal, $scope, $cookieStore) {
    
//    if (hasGetUserMedia()) {
//
//        if (criouwebcam === false) {
//            criouwebcam = true;
//            var ss = '<video autoplay id="vid" style="width:350px;height:460px;position:relative;left:62px;top:-100px"  ></video>' +
//                    '<canvas id="canvas2" width="640" height="480" style="border:1px solid #d3d3d3;position:relative;left:60px;display:none"></canvas>';
//            
//            $("#webcam").html(ss);
//
//            setTimeout(function () {
//                video = document.querySelector("#vid");
//                canvas = document.querySelector('#canvas2');
//                ctx = canvas.getContext('2d');
//                localMediaStream = null;
//
//                var onCameraFail = function (e) {
//                    console.log('Camera did not work.', e);
//                };
//
//
//                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
//                window.URL = window.URL || window.webkitURL;
//                navigator.getUserMedia({video: true}, function (stream) {
//                    video.src = window.URL.createObjectURL(stream);
//                    localMediaStream = stream;
//                }, onCameraFail);
//            }, 1000);
//        }
//    }
//    
//    var box = document.getElementById('box');
//    document.getElementById('shadowing').style.display = 'block';
//    var btitle = document.getElementById('boxtitle');
//    btitle.innerHTML = formtitle;
//    if (fadin) {
//        gradient("box", 0);
//        fadein("box");
//    } else {
//        box.style.display = 'block';
//    }
//}