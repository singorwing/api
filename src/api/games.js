import {Router} from 'express';
import Artists from '../models/artists';
import DuelThemes from '../models/duel-themes';
import FindSongs from '../models/find-songs';
import Intros from '../models/intros';
import Songs from '../models/songs';
import * as websocket from '../websocket';
import shuffle from '../utils/shuffle';

export default function() {
	let api = Router();

	api.get('/start', (req, res) => {
		let promisses = [],
			games = {};

		promisses.push(Artists.find().distinct('_id').then(artists => {
			games.artists = {
				current: 0,
				list: shuffle(artists)
			};
		}).catch(() => {}));

		promisses.push(DuelThemes.find().distinct('_id').then(duelThemes => {
			games.duelThemes = {
				current: 0,
				list: shuffle(duelThemes)
			};
		}).catch(() => {}));

		promisses.push(FindSongs.find().distinct('_id').then(findSongs => {
			games.findSongs = {
				current: 0,
				list: shuffle(findSongs)
			};
		}).catch(() => {}));

		promisses.push(Intros.find().distinct('_id').then(intros => {
			games.intros = {
				current: 0,
				list: shuffle(intros)
			};
		}).catch(() => {}));

		promisses.push(Songs.find().distinct('_id').then(songs => {
			games.songs = {
				current: 0,
				list: shuffle(songs)
			};
		}).catch(() => {}));

		Promise.all(promisses).then(() => {
			req.session.games = games;
			res.json({ success: true });
		}).catch(() => {})
	});

	api.get('/reset', (req, res) => {
		res.json({ success: true });
	});

	api.get('/next/:game', (req, res) => {
		req.session.games[req.params.game].current++;
		if(req.session.games[req.params.game].current >= req.session.games[req.params.game].list.length) {
			req.session.games[req.params.game].current = 0;
		}
		websocket.send({ _id: req.session.games[req.params.game].list[req.session.games[req.params.game].current] });
		res.json({ _id: req.session.games[req.params.game].list[req.session.games[req.params.game].current] });
	});

	api.get('/prev/:game', (req, res) => {
		req.session.games[req.params.game].current--;
		if(req.session.games[req.params.game].current < 0) {
			req.session.games[req.params.game].current = req.session.games[req.params.game].list.length - 1;
		}
		websocket.send({ _id: req.session.games[req.params.game].list[req.session.games[req.params.game].current] });
		res.json({ _id: req.session.games[req.params.game].list[req.session.games[req.params.game].current] });
	});

	return api;
}
