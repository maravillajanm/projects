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
            let table2 = document.getElementById('tableEstimateActuals')
            let table3 = document.getElementById('tableGap')
            let table4 = document.getElementById('table-review-points')
            const adoURL = "https://dev.azure.com/Daily-QA-List/IMBA/_workitems/edit/"
            table1.innerHTML=""

            for (let i = 0; i < results.value.length; i++) {
                let item = results.value[i];
                let adoURLID = adoURL + item.id
                let row1 = `<tr>             
                                <td><a href="${adoURLID}" target="_blank">${item.id}</a></td>
                                <td class="developer-name">${item.fields["Custom.Developer"].displayName}</td>
                                <td>${item.fields["Custom.TypeofUpdate"]}</td>
                                <td>${item.fields["System.State"]}</td>
                                <td class="story-points">${item.fields["Microsoft.VSTS.Scheduling.StoryPoints"]}</td>
                            </tr>`

                    table1.innerHTML += row1;

                    let newEstimatedEffortHours = item.fields["Custom.EstimatedEffortHours"];
                    let newActualEffortHours = item.fields["Custom.ActualEffortHours"];
                    if (newEstimatedEffortHours >= newActualEffortHours) {
                        differenceInEffort = 'Within Estimates'
                    }
                    else {
                        differenceInEffort = 'Exceeded'
                    }

                    let row2 = `<tr>
                                <td><a href="${adoURLID}" target="_blank">${item.id}</a></td>
                                <td>${item.fields["Custom.Developer"].displayName}</td>
                                <td>${item.fields["Custom.TypeofUpdate"]}</td>
                                <td>${item.fields["Custom.EstimatedEffortHours"]}</td>
                                <td class="actual-effort-hours">${item.fields["Custom.ActualEffortHours"]}</td>
                                <td class="difference-in-effort">${differenceInEffort}</td>
                                <td>${item.fields["Custom.ImpedimentsorBlockers"]}</td>
                            </tr>`
                    
                    table2.innerHTML += row2;

                    let resultCreatedDate = item.fields["System.CreatedDate"];
                    let fullCreatedDate = new Date(resultCreatedDate);
                    let newCreatedDate = String(fullCreatedDate).substring(0, 24);
                    let resultActivatedDate = item.fields["Custom.ActivatedDateV2"];
                    let fullActivatedDate = new Date(resultActivatedDate);
                    let newActivatedDate = String(fullActivatedDate).substring(0, 24);

                    let timeGap = fullActivatedDate - fullCreatedDate;
                    if (timeGap > 60e3) {
                        timeGap = Math.floor(timeGap / 60e3) + ' minutes'
                    }
                    else {
                        timeGap = Math.floor(timeGap/ 1e3) + ' seconds'
                    }
                    
                    let row3 = `<tr>
                                <td><a href="${adoURLID}" target="_blank">${item.id}</a></td>
                                <td>${item.fields["Custom.Developer"].displayName}</td>
                                <td>${newCreatedDate}</td>
                                <td>${newActivatedDate}</td>
                                <td class="time-gap">${timeGap}</td>
                            </tr>`
                    
                    table3.innerHTML += row3;

                    let row4 = `<tr>
                                <td><a href="${adoURLID}" target="_blank">${item.id}</a></td>
                                <td>${item.fields["Custom.Developer"].displayName}</td>
                                <td>${item.fields["Custom.QAComment"]}</td>
                                <td class="rework-hours">${item.fields["Custom.ReworkHours"]}</td>
                            </tr>`

                    table4.innerHTML += row4;

            }
            $('#generate span').removeClass('spinner-border');
        });
});


// Generate Warnings
$("#analyze-data").click(function() {
    // Time Gap
    $(".time-gap").each(function() {
    let timeGapValue = parseInt($(this).text())
    if (timeGapValue > 30){
      $(this).css({"background-color" : "red", "color" : "white"})
    } else {
    $(this).css("background-color", "#24DC34")
    }
    })

    // Estimates
    $(".difference-in-effort").each(function() {
        let differenceInEffort = $(this).text()
        if (differenceInEffort == 'Exceeded'){
          $(this).css({"background-color" : "red", "color" : "white"})
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
            $(this).text("N/A")
            }
            })

    
    //Deveoper Details
    $(".developer-name").each(function() {
        let DeveloperName = $(this).text()
        
        if (DeveloperName === "Crystal Yehn Casona") {
            $(this).parents('tr').find('.story-points').addClass("yen")
        }
        if (DeveloperName === "Edgar John Castillo") {
            $(this).parents('tr').find('.story-points').addClass("edgar")
            
            // $(this).parents('tr').find('.story-points').each(function() {
            //   let floated = parseInt($(this).text());
            //   sum += floated
            // });
        }
        
        

        //     $('.story-points').each(function() {
        //       var floted = parseFloat($(this).text());
        //       if (!isNaN(floted)) sum += floted;
        //     });
          
        //     console.log(sum);   
        // }
    })

    // Developer Sum

    let sum1 = 0;
    let sum2 = 0;
    let sum3 = 0; 
    let controlsEdgar = $(".edgar");
        
        for (let i = 0; i < controlsEdgar.length; i++) {
            let ct1 = parseFloat($(controlsEdgar[i]).text());
            sum1 += ct1;
        }
        console.log(sum1);

    let controls2 = $(".yen");

    for (let i = 0; i < controls2.length; i++) {
            let ct2 = parseFloat($(controls2[i]).text());
            sum2 += ct2;
    }
    console.log(sum2);

    let controls3 = $(".story-points");

    for (let i = 0; i < controls3.length; i++) {
            let ct3 = parseFloat($(controls3[i]).text());
            sum3 += ct3;
    }
    console.log(sum3);
})