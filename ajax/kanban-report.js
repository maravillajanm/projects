$("#generate").click(function() {
    //$( document ).ready(function() {
        let adoNumberInput = document.getElementById("adoNumbers").value;
        $.ajax({
            url: 'https://dev.azure.com/Daily-QA-List/IMBA/_apis/wit/workitems?ids=' + adoNumberInput + '&api-version=6.0',
            //url: 'https://dev.azure.com/Daily-QA-List/IMBA/_apis/wit/workitems?ids=51603,51604&api-version=6.0',
            dataType: 'json',
            headers: {
                'Authorization': 'Basic ' + btoa("" + ":" + "xu3ectrfjj7noibyk35a7epsueo77mzs6kjnhrpaqf3htw35ndeq")
            }
        }).done(function(results) {
            console.log(results);
            //console.log(results.value[0].fields["Custom.ActivatedDateV2"]);
            let table1 = document.getElementById('tableAssignedADOs')
            let table2 = document.getElementById('tableEstimateActuals')
            let table3 = document.getElementById('tableGap')

            for (let i = 0; i < results.value.length; i++) {
                let item = results.value[i];
                let row1 = `<tr>
                                <td>${item.id}</td>
                                <td>${item.fields["Custom.Developer"].displayName}</td>
                                <td>${item.fields["Custom.TypeofUpdate"]}</td>
                                <td>${item.fields["System.State"]}</td>
                                <td>${item.fields["Microsoft.VSTS.Scheduling.StoryPoints"]}</td>
                            </tr>`

                    table1.innerHTML += row1;

                    let newEstimatedEffortHours = item.fields["Custom.EstimatedEffortHours"];
                    let newActualEffortHours = item.fields["Custom.ActualEffortHours"];
                    if (newEstimatedEffortHours >= newActualEffortHours) {
                        differenceInEffort = 'Within Estimates'
                    }
                    else {
                        differenceInEffort = 'Exceeded. Why?'
                    }

                    let row2 = `<tr>
                                <td>${item.id}</td>
                                <td>${item.fields["Custom.Developer"].displayName}</td>
                                <td>${item.fields["Custom.TypeofUpdate"]}</td>
                                <td>${item.fields["Custom.EstimatedEffortHours"]}</td>
                                <td>${item.fields["Custom.ActualEffortHours"]}</td>
                                <td>${differenceInEffort}</td>
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
                        timeGap = Math.floor(timeGap / 60e3) + ' minutes of gap'
                    }
                    else {
                        timeGap = Math.floor(timeGap/ 1e3) + ' seconds of gap'
                    }
                    
                    let row3 = `<tr>
                                <td>${item.id}</td>
                                <td>${item.fields["Custom.Developer"].displayName}</td>
                                <td>${newCreatedDate}</td>
                                <td>${newActivatedDate}</td>
                                <td>${timeGap}</td>
                            </tr>`
                    
                    table3.innerHTML += row3;

            }   
        });
    });
    $("#dashboardPane button").on('click', function(){
    $(this).siblings().removeClass('active')
    $(this).addClass('active');
})