$("#generate").click(function() {
        $("#assigned-ados").hide();
        $('#generate span').text(' Loading');
        $('#generate i').addClass('spinner-border');
        
        // Insert Personal Access Token below. Should not be shared to others. Expires depending on the months you've selected.
        const accessToken = "mznwewqtdhrx7najwjlgcvv3mg6luy6ae5zmrbxv4hw6xxgmcisq"


        let adoNumbersCleanUp = document.getElementById("adoNumbers").value;
        let adoNumberInput = adoNumbersCleanUp.replace(/\n|\s,|\s\n/g, ",");
        console.log(adoNumberInput)
        $.ajax({
            url: 'https://dev.azure.com/Daily-QA-List/IMBA/_apis/wit/workitems?ids=' + adoNumberInput + '&api-version=6.0',
            dataType: 'json',
            headers: {
                'Authorization': 'Basic ' + btoa("" + ":" + accessToken)
            },     
            error: function(xhr, status, error) {
                alert("Please input ADOs separated by comma or newline. Ensure no spaces or newline at the start & end.")
                $('#generate span').text(' Get Data');
                $('#generate i').removeClass('spinner-border')
            }   
        }).done(function buildTable (results) {
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

                let row1 = `<tr id="row-`+[i+1]+`" class="tr-parent" data-dev-name="`+item.fields["Custom.Developer"].displayName+`">             
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

            $("#assigned-ados").fadeIn();
            $('#generate span').text(' Get Data');
            $('#generate i').removeClass('spinner-border')
            $('#get-data-cover').fadeIn();
        });
    $(".display-overview, .analyze-message").hide();
});


// Analyze Data
$("#analyze-data").click(function() {
    $('#analyze-data span').text(' Loading');
    $('#analyze-data i').addClass('spinner-border');
    $("#table-overview").empty();
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
        } 
        else {
            $(this).css("background-color", "#24DC34")
        }
    })

    //Backlog Identifier
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
        } 
        else if (differenceInEffort == 'For Monitoring'){
            $(this).css("background-color", "orange")
        } 
        else {
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

    //Summary Breakdown
    let controlsSPDeveloper = [];
    let totalStoryPoints = 0;
    let totalActualHoursEffort = 0;
    let totalRegularTix = 0;
    let totalAdminTix = 0;
    let totalClosedRegTickets = 0;
    let totalBacklogs = 0;
    let totalCentralTracker = 0;
    
    $(".tr-parent").each(function(){
        controlsSPDeveloper.push($(this).attr("data-dev-name"));
    });
    
    let cleanUpControlsDev = controlsSPDeveloper.filter((k, index) => {
        return controlsSPDeveloper.indexOf(k) === index;
    });
    cleanUpControlsDev.sort();

    //for each Dev Summary
    for (let i = 0; i < cleanUpControlsDev.length; i++) {
        let getEachStoryPoints = $(`.tr-parent[data-dev-name="`+cleanUpControlsDev[i]+`"] .story-points`);
        let getEachActualHoursEffort = $(`.tr-parent[data-dev-name="`+cleanUpControlsDev[i]+`"] .actual-effort-hours`);
        let getRequestType = $(`.tr-parent[data-dev-name="`+cleanUpControlsDev[i]+`"] .request-type`);
        let getEachBacklog = $(`.tr-parent[data-dev-name="`+cleanUpControlsDev[i]+`"] .backlog-identifier`);
        let sumStoryPoints = 0;
        let sumActualHoursEffort = 0;
        let sumRegularTix = 0;
        let sumCentralTracker = 0;
        let sumAdminTix = 0;
        let sumClosedRegTickets = 0;
        let sumBacklogs = 0;
            for (let i = 0; i < getEachStoryPoints.length; i++) {
                sumStoryPoints += parseFloat($(getEachStoryPoints[i]).text());
            }
            for (let i = 0; i < getEachActualHoursEffort.length; i++) {
                sumActualHoursEffort += parseFloat($(getEachActualHoursEffort[i]).text());;
                sumActualHoursEffort = Math.round(sumActualHoursEffort*100)/100
            }
            for (let i = 0; i < getEachBacklog.length; i++) {
                let requestType = $(getRequestType[i]).text();
                if (requestType === "ADMIN") {
                    continue
                } else if (requestType === "Page Maintenance"){
                continue
                } else {
                    let backlogIdentifier = parseInt($(getEachBacklog[i]).text());
                    if (backlogIdentifier > 720) {
                    sumBacklogs ++;
                    } 
                }
            }
            for (let i = 0; i < getRequestType.length; i++) {
                let requestType = $(getRequestType[i]).text();
                let requestState = $(getRequestType[i]).closest(".tr-parent").find(".ado-state").text();
                if (requestType === "ADMIN") {
                    sumAdminTix ++;
                } 
                else if (requestType === "Page Maintenance") {  
                    sumCentralTracker ++;
                }
                else {
                    sumRegularTix ++;
                }
                if (requestType !== "ADMIN" && requestType !== "Page Maintenance" && requestState === "Closed") {
                    sumClosedRegTickets ++;
                }
            }
            $("#table-overview").append(`<tr id="row_total_`+[i+1]+`" data-dev-total="`+cleanUpControlsDev[i]+`">
                <th>${cleanUpControlsDev[i]}</th>
                <th>${sumRegularTix}</th>
                <th>${sumClosedRegTickets}</th>
                <th>${sumBacklogs}</th>
                <th>${sumCentralTracker}</th>
                <th>${sumAdminTix}</th>
                <th>${sumStoryPoints}</th>
                <th>${sumActualHoursEffort}</th>
                </tr>
            `);
            totalStoryPoints += sumStoryPoints;
            totalActualHoursEffort += sumActualHoursEffort;
            totalActualHoursEffort = Math.round(totalActualHoursEffort * 100)/100;
            totalRegularTix += sumRegularTix;
            totalAdminTix += sumAdminTix;
            totalClosedRegTickets += sumClosedRegTickets;
            totalBacklogs += sumBacklogs;
            totalCentralTracker += sumCentralTracker;
    };
    
    //Total Values Table Row
    $("#table-overview").append(`<tr>
        <th>Total</th>
        <th>${totalRegularTix}</th>
        <th>${totalClosedRegTickets}</th>
        <th>${totalBacklogs}</th>
        <th>${totalCentralTracker}</th>
        <th>${totalAdminTix}</th>
        <th>${totalStoryPoints}</th>
        <th>${totalActualHoursEffort}</th>
        </tr>`);

        $('#analyze-data span').text(' Analyze');
        $('#analyze-data i').removeClass('spinner-border');
        $('#get-data-cover').hide();
    
    // Analyze Message
    if(controlsSPDeveloper.length > 0){
        $(".display-overview, .analyze-message").fadeIn();
    }
})