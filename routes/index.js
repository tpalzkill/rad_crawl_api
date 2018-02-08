
const router = require('koa-router')()

const config = require('../knexfile')['production'];
const knex = require('knex')(config);
const bcrypt = require('bcryptjs');
const passport = require('koa-passport');
const localStrategy = require('passport-local').Strategy;
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');
const options = {};
const yelp = require('yelp-fusion');
const searchRequest = {
  open_now: true,
  sort_by: 'distance',
  categories: 'bars',
  latitude: 30.289270,
  longitude: -97.705416
};
const apiKey = 'OajGsHzjCPKSBq38RccMn2xV-WaMReCMpGxZdzP0N0N_M8jnrqjwgfOcLqsnbsMplCJATa2W7UWKzkTnxR7moN2IZNiOVsBqZdP6AQ4hjnLnkagnDTds4nwm1J14WnYx';
const client = yelp.client(apiKey);

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}
// putting a conditional on post routes to check if party leader if limited
// ~~~~~~~~~~~~~~~~~~~~Passport Shit~~~~~~~~~~~~~~~~~~~~~~~~~~~~

passport.serializeUser((user, done) => {
  console.log('serial killa');
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log('ceramn l killed');
  if (id) {
    return knex('users').where({
        id
      }).first()
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err, null);
      });
  }
});

passport.use(new localStrategy(options, (email, password, done) => {
  knex('users').where({
      email
    }).first()
    .then((user) => {
      if (!user) return done(null, false);
      if (!comparePass(password, user.hashed_password)) {
        console.log('1');
        return done(null, false);
      } else {
        console.log('2');
        return done(null, user);
      }
    })
    .catch((err) => {
      return done(err);
    });
}));

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// let isLeader = async function(id){
//   try {
//   let yeah = await knex('users').join('parties','users.id','parties.partyleader').select('users.id');
//   console.log(yeah[0].id,Number(id));
// if (yeah[0].id === Number(id)) {ctx.body = true} else {ctx.body = false};
// } catch(err) {
//   ctx.status = 400;
//   ctx.body = {
//     status: 'error',
//     message: 'ctx.request.body'|| 'Sorry, an error has occurred.'
//   };
// }
// }

// ~~~~~~~~~~~~~~~~~~Auth Routes & Register~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/login', async ctx => {

});

router.post('/login', async ctx => {
  return passport.authenticate('local', (err, user, info, status) => {
    if (user) {
      ctx.login(user);
      ctx.body = {
        status: "logged in foo"
      };
    } else {
      ctx.status = 400;
      ctx.body = {
        status: err,
        user,
        info,
        status
      };
    }
  })(ctx);
});

router.get('/logout', async (ctx) => {
  if (ctx.isAuthenticated()) {
    ctx.logout();
    ctx.body = {
      status: 'I Logged out fool'
    };
  } else {
    ctx.body = {
      success: false
    };
    ctx.throw(401);
  }
});

router.post('/register', async ctx => {
  const saltRounds = 10;
  try {

    const new_user = await knex('users')
      .insert({
        email: ctx.request.body.email,
        hashed_password: bcrypt.hashSync(ctx.request.body.password, saltRounds),
        profile_photo: ctx.request.body.profile_photo,
        full_name: ctx.request.body.full_name,
        location: ctx.request.body.location,
      })
      .returning('*');

    if (new_user.length) {
      ctx.status = 201;
      ctx.body = {
        status: 'success',
        data: ctx.request.body
      };
    } else {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: request.body || 'Something went wrong.'
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: err.message || 'Sorry, an error has occurred.'
    };
  }
})

let yelpCall = function() {
  return client.search(searchRequest).then(response => {
    const firstResult = response.jsonBody;
    const prettyJson = JSON.stringify(firstResult, null, 4);
    console.log(firstResult);
    return firstResult;
  }).catch(e => {
    console.log(e);
  });
}


/*
 * GET /
 */
//landing after login
router.get('/landing', async ctx => {
if (ctx.isAuthenticated()) {
  try {

    //location should come through hidden forms submitted on load and then be sent to make a route
    const currLat = ctx.req.currLat;
    const currLon = ctx.req.currLon;
    const users = await knex('users').select('*');
    const parties = await knex('parties').select('*');
    const challenges = await knex('challenges').select('*')
    let bars = await yelpCall();
    ctx.body = {
      status: 'success',
      data: users,
      parties,
      challenges,
      bars,
    };
  } catch (err) {
    console.log(err)
  }} else {
    ctx.body = {
      success: false
    };
    ctx.throw(401);
  }
});

// On click of New Crawl provide yelp results to create route w/ mapbox on the frontend

router.get('/new_route', async ctx => {
  if (ctx.isAuthenticated()) {
  try {
    const currLat = ctx.req.currLat;
    const currLon = ctx.req.currLon;
    const users = await knex('users').select('*');
    const parties = await knex('parties').select('*');
    const challenges = await knex('challenges').select('*')
    let bars = await yelpCall();
    ctx.body = {
      status: 'success',
      data: users,
      parties,
      challenges,
      bars,
    };
  } catch (err) {
    console.log(err)
  }} else {
    ctx.body = {
      success: false
    };
    ctx.throw(401);
  }
})

// After route is determined choose that party send invites by email address
//(Whoever clicks this is party leader)

router.post('/new_party/:user_id', async ctx => {
  if (ctx.isAuthenticated()) {
  try {
    const new_party = await knex('parties').insert(ctx.request.body).returning('*');
    if (new_party.length) {
      ctx.status = 201;
      ctx.body = {
        status: 'success',
        data: ctx.request.body
      };
    } else {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: ctx.request.body || 'Something went wrong.'
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: ctx.request.body || 'Sorry, an error has occurred.'
    };
  }} else {
    ctx.body = {
      success: false
    };
    ctx.throw(401);
  }
})
// id is the user id of who is being invited
router.post('/send_invite/:party_id/:user_id', async ctx => {
  if (ctx.isAuthenticated()) {
  try {
    const invite = await knex('user_party')
      .insert({
        user_id: ctx.params.user_id,
        party_id: ctx.params.party_id
      })
      .returning('*');

    if (invite.length) {
      ctx.status = 201;
      ctx.body = {
        status: 'success',
        data: ctx.request.body
      };
    } else {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: ctx.request.body || 'Something went wrong.'
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: ctx.request.body || 'Sorry, an error has occurred.'
    };
  }} else {
    ctx.body = {
      success: false
    };
    ctx.throw(401);
  }
})

router.post('/invite_response/:user_id/:party_id', async ctx => {
  if (ctx.isAuthenticated()) {
  try {
    const invite_response = await knex('user_party').where('party_id', '=', ctx.params.party_id).andWhere('user_id', '=', ctx.params.user_id).update({
      response: ctx.request.body.response
    }).returning('*');
    if (invite_response.length) {
      ctx.status = 201;
      ctx.body = {
        status: 'success',
        data: ctx.request.body
      };
    } else {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: ctx.request.body || 'Something went wrong.'
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: ctx.request.body || 'Sorry, an error has occurred.'
    };
  }} else {
    ctx.body = {
      success: false
    };
    ctx.throw(401);
  }
})

// party = user_party where party_id = url and response = true
router.get('/current_party/:user_id/:party_id', async ctx => {
  if (ctx.isAuthenticated()) {
  try {
    const current_party = await knex('users').join('user_party', 'users.id', 'user_party.user_id').select('full_name').where('party_id', ctx.params.party_id).andWhere('response', 'True').returning('*');
    ctx.body = {
      status: 'success',
      data: current_party
    };
  } catch (err) {
    console.log(err)
  }} else {
    ctx.body = {
      success: false
    };
    ctx.throw(401);
  }
})

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~challenges~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/challenges', async ctx => {
  if (ctx.isAuthenticated()) {
  try {
    const users = await knex('users').select('*');
    const parties = await knex('parties').select('*');
    const challenges = await knex('challenges').select('*');
    ctx.body = {
      status: 'success',
      data: users,
      challenges,
    };
  } catch (err) {
    console.log(err)
  }} else {
    ctx.body = {
      success: false
    };
    ctx.throw(401);
  }
});

router.get('/challenges/:id', async ctx => {
  if (ctx.isAuthenticated()) {
  try {
    let someDeet = ctx.params.id;
    const users = await knex('users').select('*');
    const parties = await knex('parties').select('*');
    const challenges = await knex('challenges').select('*').where({
      id: ctx.params.id
    });
    ctx.body = {
      status: 'success',
      data: users,
      challenges,
    };
  } catch (err) {
    console.log(err)
  }} else {
    ctx.body = {
      success: false
    };
    ctx.throw(401);
  }
});

router.post('/new_challenge', async ctx => {
  if (ctx.isAuthenticated()) {
  try {
    const new_challenge = await knex('challenges').insert(ctx.request.body).returning('*');
    if (new_challenge.length) {
      ctx.status = 201;
      ctx.body = {
        status: 'success',
        data: ctx.request.body
      };
    } else {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: ctx.request.body || 'Something went wrong.'
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: ctx.request.body || 'Sorry, an error has occurred.'
    };
  }} else {
    ctx.body = {
      success: false
    };
    ctx.throw(401);
  }
})

router.post('/complete_challenge/:user_id/:challenge_id', async ctx => {
  if (ctx.isAuthenticated()) {
  try {
    const complete_challenge = await knex('challenges').where({
      id: ctx.params.challenge_id
    }).update({
      completed: 'True',
      completed_by: ctx.params.user_id
    }).returning('*');
    const challenge_value = await knex('users').join('challenges', 'users.id', 'challenges.completed_by').select('points');
    console.log(challenge_value[0].points)
    const score_update = await knex('users').where({
      id: ctx.params.user_id
    }).update({
      score: challenge_value[0].points
    }).returning('*');
    if (challenge_value.length) {
      ctx.status = 201;
      ctx.body = {
        status: 'success',
        data: ctx.request.body
      };
    } else {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: ctx.request.body || 'Something went wrong.'
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: ctx.request.body || 'Sorry, an error has occurred.'
    };
  }} else {
    ctx.body = {
      success: false
    };
    ctx.throw(401);
  }
});


router.post('/leave_party/:user_id/:party_id', async ctx => {
if (ctx.isAuthenticated()) {
  const leave_party = await knex('user_party').where('party_id', '=', ctx.params.party_id).andWhere('user_id', '=', ctx.params.user_id).update({
    response: false
  }).returning('*');
  if (invite_response.length) {
    ctx.status = 201;
    ctx.body = {
      status: 'success',
      data: ctx.request.body
    };
  } else {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: ctx.request.body || 'Something went wrong.'
    };
  }
} else {
  ctx.body = {
    success: false
  };
  ctx.throw(401);
}
});


router.get('/completed_parties/:user_id', async ctx => {
if (ctx.isAuthenticated()) {
  try {
    const users = await knex('users').select('*');
    const parties = await knex('parties').join('user_party', 'party.id', 'user_party.user_id').where('complete',true).select('*');
    const challenges = await knex('challenges').select('*');
    ctx.body = {
      status: 'success',
      data: parties, users, challenges

    };
  } catch (err) {
    console.log(err)
  }
} else {
  ctx.body = {
    success: false
  };
  ctx.throw(401);
}
});

router.get('/end_party/:user_id/:party_id', async ctx => {
if (ctx.isAuthenticated()) {
  try {
    const isLeader = await knex('parties').select('partyleader').where('id', ctx.params.party_id);
    console.log(ctx.params.user_id, isLeader[0].partyleader);
    if (ctx.params.user_id == isLeader[0].partyleader) {
      const end_party = await knex('parties').update({
        complete: true
      }).where('id', ctx.params.party_id);
      if (end_party) {
        ctx.status = 201;
        ctx.body = {
          status: 'success',
          data: ctx.request.body
        };
      } else {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: ctx.request.body || 'Something went wrong.'
        };
      }
    } else {
      console.log('head')
    };
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: err.message || 'Sorry, an error has occurred.'
    }
  }} else {
    ctx.body = {
      success: false
    };
    ctx.throw(401);
  }
});

// router.get('/users/:id', async ctx => {
//
//   try {
//     let pulledId = ctx.params.id;
//     const users = await knex('users').select('*').where({
//       id: pulledId
//     });
//     const parties = await knex('parties').select('*');
//     const challenges = await knex('challenges').select('*');
//     ctx.body = {
//       status: 'success',
//       data: users,
//     };
//   } catch (err) {
//     console.log(err)
//   }
// });


router.get('/scoreboard/:party_id/:user_id', async ctx => {
if (ctx.isAuthenticated()) {
  try {
    const users = await knex('users').select('*');
    const parties = await knex('parties').select('*');
    const userparty = await knex('user_party').select('*');
    const challenges = await knex('challenges').select('*');
    ctx.body = {
      status: 'success',
      data: parties,
      userparty
    };
  } catch (err) {
    console.log(err)
  }} else {
    ctx.body = {
      success: false
    };
    ctx.throw(401);
  }
});






router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
