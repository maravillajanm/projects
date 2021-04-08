$('th').on('click', function(){
    let column = $(this).data('column')
    let order = $(this).data('order')
    let text = $(this).html()
    text = text.substring(0, text.length -1)

    if (order == "desc"){
        $(this).data('order', 'asc')
        myArray = results.sort((a,b) => a[column] > b[column] ? 1 : -1)
        text += '&#9660'
    }else {
        $(this).data('order', 'desc')
        myArray = results.sort((a,b) => a[column] > b[column] ? 1 : -1)
        text += '&#9650'
    }
    buildTable(myArray)
});

//http://jsfiddle.net/Jsar8/1/

$("#generate").click(function() {
    
    //$( document ).ready(function() {
        $('#generate span').addClass('spinner-border');

        let adoNumberInput = document.getElementById("adoNumbers").value;
        $.ajax({
            url: 'https://dev.azure.com/Daily-QA-List/IMBA/_apis/wit/workitems?ids=' + adoNumberInput + '&api-version=6.0',
            //url: 'https://dev.azure.com/Daily-QA-List/IMBA/_apis/wit/workitems?ids=51603,51604&api-version=6.0',
            dataType: 'json',
            headers: {
                'Authorization': 'Basic ' + btoa("" + ":" + "xu3ectrfjj7noibyk35a7epsueo77mzs6kjnhrpaqf3htw35ndeq")
            }
        }).done(function buildTable (results) {
            console.log(results);
            let table1 = document.getElementById('tableAssignedADOs')
            const adoURL = "https://dev.azure.com/Daily-QA-List/IMBA/_workitems/edit/"
            table1.innerHTML=""

            for (let i = 0; i < results.value.length; i++) {
                let item = results.value[i];
                let adoURLID = adoURL + item.id
                let newEstimatedEffortHours = item.fields["Custom.EstimatedEffortHours"];
                let newActualEffortHours = item.fields["Custom.ActualEffortHours"];                    
                    if (newEstimatedEffortHours >= newActualEffortHours) {
                    differenceInEffort = 'Within Estimates'
                    } else if (newActualEffortHours === undefined ) {
                        differenceInEffort = 'For Monitoring'
                    } else {
                    differenceInEffort = 'Exceeded'
                    }
                let resultClosedDate = item.fields["Microsoft.VSTS.Common.ClosedDate"];
                let fullClosedDate = new Date(resultClosedDate);
                let newClosedDate = String(fullClosedDate).substring(0, 24);
                let resultReviewDate = item.fields["Custom.TimeSentforReview"];
                let fullReviewDate = new Date(resultReviewDate);
                let newReviewDate = String(fullReviewDate).substring(0, 24);
                let resultCreatedDate = item.fields["System.CreatedDate"];
                let fullCreatedDate = new Date(resultCreatedDate);
                let newCreatedDate = String(fullCreatedDate).substring(0, 24);
                let resultActivatedDate = item.fields["Custom.ActivatedDateV2"];
                let fullActivatedDate = new Date(resultActivatedDate);
                let newActivatedDate = String(fullActivatedDate).substring(0, 24);

                let timeGap = fullActivatedDate - fullCreatedDate;
                    if (timeGap > 60e3) {
                        timeGap = Math.floor(timeGap / 60e3) + ' minutes'
                    } else {
                        timeGap = "less than a minute"
                    }

                let backlogIdentifier = fullClosedDate - fullCreatedDate;
                    if (backlogIdentifier > 60e3) {
                        backlogIdentifier = Math.floor(backlogIdentifier / 60e3) + ' minutes'
                    } else {
                        backlogIdentifier = "less than a minute"
                    }
                    


                let row1 = `<tr>             
                                <td><a href="${adoURLID}" target="_blank">${item.id}</a></td>
                                <th class="developer-name">${item.fields["Custom.Developer"].displayName}</th>
                                <td class="request-type">${item.fields["Custom.Type"]}</td>
                                <td>${item.fields["Custom.TypeofUpdate"]}</td>
                                <td class="ado-state">${item.fields["System.State"]}</td>
                                <td class="story-points">${item.fields["Microsoft.VSTS.Scheduling.StoryPoints"]}</td>
                                <td>${newCreatedDate}</td>
                                <td>${newActivatedDate}</td>
                                <td class="time-gap">${timeGap}</td>
                                <td>${item.fields["Custom.EstimatedEffortHours"]}</td>
                                <td class="actual-effort-hours">${item.fields["Custom.ActualEffortHours"]}</td>
                                <td class="difference-in-effort">${differenceInEffort}</td>
                                <td>${newReviewDate}</td>
                                <td class="rework-hours">${item.fields["Custom.ReworkHours"]}</td>
                                <td class="closed-date">${newClosedDate}</td>
                                <td class="backlog-identifier" style="display:none">${backlogIdentifier}</td>
                            </tr>`

                    table1.innerHTML += row1;
            }

            //Replace Undefined Values
            $("td").each(function() {
             let undefinedVal = $(this).text()
        
            if (undefinedVal === "undefined") {
            $(this).text("0")
            } else if (undefinedVal === "Invalid Date") {
                $(this).text("N/A")
            }})

            $("#assigned-ados").css({"display" : "block"})
            $('#generate span').removeClass('spinner-border');
        });
});


// Analyze Data
$("#analyze-data").click(function() {
    
    // State
    $(".ado-state").each(function() {
        let adoState = $(this).text()
        
        if (adoState === "Closed") {
            $(this).css("background-color", "#24DC34")
        }
        else {
            $(this).css("background-color", "orange")
        }
    })
    
    // Time Gap
    $(".time-gap").each(function() {
    let timeGapValue = parseInt($(this).text())
    if (timeGapValue > 30){
      $(this).css({"background-color" : "red", "color" : "white"})
    } else {
    $(this).css("background-color", "#24DC34")
    }
    })

    // Backlog Identifier
    $(".backlog-identifier").each(function() {
        let backlogIdentifier = parseInt($(this).text())
        if (backlogIdentifier > 720){
        $(this).parents('tr').find('.closed-date').css("background-color", "orange")
        }
        })

    // Estimates
    $(".difference-in-effort").each(function() {
        let differenceInEffort = $(this).text()
        if (differenceInEffort == 'Exceeded'){
          $(this).css({"background-color" : "red", "color" : "white"})
        } else if (differenceInEffort == 'For Monitoring'){
            $(this).css("background-color", "orange")
        } else {
        $(this).css("background-color", "#24DC34")
        }
        })

        // Rework Hours
        $(".rework-hours").each(function() {
            let ReworkHours = parseInt($(this).text())

            if (ReworkHours > 0.5){
              $(this).css({"background-color" : "red", "color" : "white"})
            } 
            else {
            $(this).css("background-color", "#24DC34")
            }
            })

    
    //Deveoper Details
    const DeveloperOne = "Crystal Yehn Casona"
    const DeveloperTwo = "Edgar John Castillo"

    $(".developer-name").each(function() {
        let DeveloperName = $(this).text()

        if (DeveloperName === DeveloperOne) {
            $(this).parents('tr').find('.story-points').addClass("yen")
            $(this).parents('tr').find('.actual-effort-hours').addClass("yen")
            $(this).parents('tr').find('.request-type').addClass("yen")
            $(this).parents('tr').find('.ado-state').addClass("yen")
            $(this).parents('tr').find('.backlog-identifier').addClass("yen")
        }
        if (DeveloperName === DeveloperTwo) {
            $(this).parents('tr').find('.story-points').addClass("edgar")
            $(this).parents('tr').find('.actual-effort-hours').addClass("edgar")
            $(this).parents('tr').find('.request-type').addClass("edgar")
            $(this).parents('tr').find('.ado-state').addClass("edgar")
            $(this).parents('tr').find('.backlog-identifier').addClass("edgar")
        }
    })

    // Developer Sum

    let sumDeveloperOne = 0;
    let sumDeveloperTwo = 0;
    let sumTotal = 0; 
    
    let controlsSPDeveloperOne = $(".story-points.yen");
    let controlsSPDeveloperTwo = $(".story-points.edgar");
    let controlsSPTotal = $(".story-points");
        
        for (let i = 0; i < controlsSPDeveloperOne.length; i++) {
            let ct1 = parseFloat($(controlsSPDeveloperOne[i]).text());
            sumDeveloperOne += ct1;
        }

        for (let i = 0; i < controlsSPDeveloperTwo.length; i++) {
            let ct2 = parseFloat($(controlsSPDeveloperTwo[i]).text());
            sumDeveloperTwo += ct2;
        }

        for (let i = 0; i < controlsSPTotal.length; i++) {
            let ct3 = parseFloat($(controlsSPTotal[i]).text());
            sumTotal += ct3;
        }

    // Actual Effort Sum
        let sumActualDeveloperOne = 0;
        let sumActualDeveloperTwo = 0;
        let sumActualTotal = 0; 

        let controlsActDeveloperOne = $(".actual-effort-hours.yen");
        let controlsActDeveloperTwo = $(".actual-effort-hours.edgar");
        let controlsActTotal = $(".actual-effort-hours");
        
        for (let i = 0; i < controlsActDeveloperOne.length; i++) {
            let ct1 = parseFloat($(controlsActDeveloperOne[i]).text());
            sumActualDeveloperOne += ct1;
        }

        for (let i = 0; i < controlsActDeveloperTwo.length; i++) {
            let ct2 = parseFloat($(controlsActDeveloperTwo[i]).text());
            sumActualDeveloperTwo += ct2;
        }

        for (let i = 0; i < controlsActTotal.length; i++) {
            let ct3 = parseFloat($(controlsActTotal[i]).text());
            sumActualTotal += ct3;
        }

        // Regular, Closed and Admin Ticket Count
        let sumRegDeveloperOne = 0;
        let sumRegDeveloperTwo = 0;
        let sumRegTotal = 0;
        let sumClosedRegDeveloperOne = 0;
        let sumClosedRegDeveloperTwo = 0;
        let sumClosedRegTotal = 0;
        let sumAdminDeveloperOne = 0;
        let sumAdminDeveloperTwo = 0;
        let sumAdminTotal = 0;
        let DeveloperOneBacklog = 0;
        let DeveloperTwoBacklog = 0;
        let TotalBacklog = 0;

        let controlsRegDeveloperOne = $(".request-type.yen");
        let controlsRegDeveloperTwo = $(".request-type.edgar");
        let controlsRegTotal = $(".request-type");
        let controlsClosedRegDeveloperOne = $(".ado-state.yen");
        let controlsClosedRegDeveloperTwo = $(".ado-state.edgar");
        let controlsClosedRegTotal = $(".ado-state");
        let controlsBacklogDeveloperOne = $(".backlog-identifier.yen");
        let controlsBacklogDeveloperTwo = $(".backlog-identifier.edgar");
        let controlsBacklogTotal = $(".backlog-identifier");

        for (let i = 0; i < controlsRegDeveloperOne.length; i++) {
            let ct1 = $(controlsRegDeveloperOne[i]).text();
            if (ct1 === "ADMIN") {
            sumAdminDeveloperOne ++;
            } else if (ct1 === "Page Maintenance") {
            sumAdminDeveloperOne ++;
            } else {
            sumRegDeveloperOne ++;
            }
        }

        for (let i = 0; i < controlsRegDeveloperTwo.length; i++) {
            let ct1 = $(controlsRegDeveloperTwo[i]).text();
            if (ct1 === "ADMIN") {
            sumAdminDeveloperTwo ++;
            } else if (ct1 === "Page Maintenance") {
            sumAdminDeveloperTwo ++;
            } else {
            sumRegDeveloperTwo ++;
            }
        }

        for (let i = 0; i < controlsRegTotal.length; i++) {
            let ct1 = $(controlsRegTotal[i]).text();
            if (ct1 === "ADMIN") {
            sumAdminTotal ++;
            } else if (ct1 === "Page Maintenance") {
            sumAdminTotal ++;
            } else {
            sumRegTotal ++;
            }
        }
        
        // Closed Regular Calculate
        for (let i = 0; i < controlsRegDeveloperOne.length; i++) {
            let ct1 = $(controlsRegDeveloperOne[i]).text();
            if (ct1 === "ADMIN") {
                continue;
                } else if (ct1 === "Page Maintenance") {
                continue
                } else {
                    let ct2 = $(controlsClosedRegDeveloperOne[i]).text();
                    if (ct2 === "Closed") {
                    sumClosedRegDeveloperOne ++;
                
                }
            }
        }

        for (let i = 0; i < controlsRegDeveloperTwo.length; i++) {
            let ct1 = $(controlsRegDeveloperTwo[i]).text();
            if (ct1 === "ADMIN") {
                continue;
                } else if (ct1 === "Page Maintenance") {
                continue
                } else {
                    let ct2 = $(controlsClosedRegDeveloperTwo[i]).text();
                    if (ct2 === "Closed") {
                    sumClosedRegDeveloperTwo ++;
                
                }
            }
        }

        for (let i = 0; i < controlsRegTotal.length; i++) {
            let ct1 = $(controlsRegTotal[i]).text();
            if (ct1 === "ADMIN") {
                continue;
                } else if (ct1 === "Page Maintenance") {
                continue
                } else {
                    let ct2 = $(controlsClosedRegTotal[i]).text();
                    if (ct2 === "Closed") {
                    sumClosedRegTotal ++;
                
                }
            }
        }

        // Backlog Regular
        for (let i = 0; i < controlsRegDeveloperOne.length; i++) {
            let ct1 = $(controlsRegDeveloperOne[i]).text();
            if (ct1 === "ADMIN") {
                continue;
                } else if (ct1 === "Page Maintenance") {
                continue
                } else {
                    let ct1 = parseInt($(controlsBacklogDeveloperOne[i]).text());
                    if (ct1 > 720){
                        DeveloperOneBacklog ++;
                    }
                }
        }
        for (let i = 0; i < controlsRegDeveloperTwo.length; i++) {
            let ct1 = $(controlsRegDeveloperTwo[i]).text();
            if (ct1 === "ADMIN") {
                continue;
                } else if (ct1 === "Page Maintenance") {
                continue
                } else {
                    let ct1 = parseInt($(controlsBacklogDeveloperTwo[i]).text());
                    if (ct1 > 720){
                        DeveloperTwoBacklog ++;
                    }
                }
        }
        
        for (let i = 0; i < controlsRegTotal.length; i++) {
            let ct1 = $(controlsRegTotal[i]).text();
            if (ct1 === "ADMIN") {
                continue;
                } else if (ct1 === "Page Maintenance") {
                continue
                } else {
                    let ct1 = parseInt($(controlsBacklogTotal[i]).text());
                    if (ct1 > 720){
                        TotalBacklog ++;
                    }
                }
        }


        // Write Overview Table
        let tableDeveloper = document.getElementById('table-overview')

        let rowDeveloperOne = `<tr>
                    <th>${DeveloperOne}</th>
                    <th>${sumRegDeveloperOne}</th>
                    <th>${sumClosedRegDeveloperOne}</th>
                    <th>${DeveloperOneBacklog}</th>
                    <th>${sumAdminDeveloperOne}</th>
                    <th>${sumDeveloperOne}</th>
                    <th>${sumActualDeveloperOne}</th>
                    </tr>
                    <tr>
                    <th>${DeveloperTwo}</th>
                    <th>${sumRegDeveloperTwo}</th>
                    <th>${sumClosedRegDeveloperTwo}</th>
                    <th>${DeveloperTwoBacklog}</th>
                    <th>${sumAdminDeveloperTwo}</th>
                    <th>${sumDeveloperTwo}</th>
                    <th>${sumActualDeveloperTwo}</th>
                    </tr>
                    <tr>
                    <th>Total</th>
                    <th>${sumRegTotal}</th>
                    <th>${sumClosedRegTotal}</th>
                    <th>${TotalBacklog}</th>
                    <th>${sumAdminTotal}</th>
                    <th>${sumTotal}</th>
                    <th>${sumActualTotal}</th>
                    </tr>`

        tableDeveloper.innerHTML = rowDeveloperOne;

    // Analyze Message
    $(".display-overview").css({"display" : "block"})
    $(".analyze-message").css({"display" : "block"})
})