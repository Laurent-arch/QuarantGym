
module.exports = async function(req, res, proceed) {
    const utils = require('../../application/utilities')
    // Here I try to check whether the customers that seeks to buy a membership has already one and redirect him to his personal page to update/cancel his status
    /** 
     * @dimitris I'm including here the code for checking whether the user has a membership in the userMembership table
     * I'm suggesting to add the req.session.hasActiveMembership(boolean) value, I'm also not updating the routing
     * as there's no page to redirect to. However the session variable is passed correctly (check the console).
     * We don't actually check if the user has an *active* membership though. This should be implemented correctly
     * 
     * ----
     * 
     * nevermind. integrating the date check template.
     * 
     * @dimitris the function will check for two dates entered and will return if the first date is later 
     * and the difference with the second date.
     * it returns an array of results in the form [boolean, int].
     * 
     * i'm leaving it here and you can complete the routing to the correct pages. 
    */

    const localUserId = req.session.user_id;
    const results = await UserMembership.find({userId:localUserId})
    let checkSub = utils.validSub

    if (results.length < 1){ // case where user was never a customer (has never bought a subscription)
        req.session.hasActiveMembership = false
        console.log('user has no membership record. set to : ' + req.session.hasActiveMembership)
        
    } else {
        
        const todayIs = new Date();
        let membList = []
        //create an array of past memberships
        for (let result in results){
            let compare = results[result].endDate
            membList.push(compare)
        }
        //get the last ending date of the subscription
        let lastDate = membList.pop()
        const [isActive, days] = checkSub(todayIs, lastDate)
        if(isActive){ // case where the user has an active subscription and has X days left
            req.session.hasActiveMembership = true
            req.session.dueDays = days
            console.log('user has membership : ' + req.session.hasActiveMembership )
        } else { // case where the user has a subscription but has expired and it's been expired for X days
            req.session.hasActiveMembership = false
            req.session.daysDue = days
        }
    }

    if (req.session.user_email) {
        return proceed(); 
    } 


    return res.view('pages/unauthorized', {data:'Please login in order to proceed'})
} 