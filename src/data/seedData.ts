/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 観戦記録.xlsx（実データ全259試合）から抽出されたマスターシードデータ
import { MatchRecord } from '../types/baseball';

export const INITIAL_SEED_RECORDS: MatchRecord[] = [
  {
    "id": "excel_d1_2017-04-05_2",
    "date": "2017-04-05",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 277,
    "pitchers": {
      "homeStarter": "八木",
      "awayStarter": "床田"
    },
    "homeRuns": [],
    "events": "オープニングシリーズ2017",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2017-08-15_3",
    "date": "2017-08-15",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "baystars",
    "awayTeamId": "dragons",
    "stadiumId": "yokohama",
    "matchType": "official",
    "matchStatus": "cancelled",
    "homeScore": null,
    "awayScore": null,
    "isScoreConfirmed": false,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "（飯塚）",
      "awayStarter": "（鈴木翔）"
    },
    "homeRuns": [],
    "notes": "雨天のため中止",
    "watchStatus": "cancelled",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {},
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "cancelled_refund",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2017-09-18_4",
    "date": "2017-09-18",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 134,
    "pitchers": {
      "homeStarter": "笠原",
      "awayStarter": "田口"
    },
    "homeRuns": [
      "藤井"
    ],
    "events": "ＦＣスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "メンバーズS"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_jp_2018-03-03_2",
    "date": "2018-03-03",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "japan_national",
    "awayTeamId": "australia",
    "stadiumId": "vantelin_dome",
    "matchType": "international",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "千賀"
    },
    "homeRuns": [],
    "events": "ENEOS 侍ジャパンシリーズ 2018",
    "watchStatus": "watched",
    "cheerTeamId": "japan_national",
    "categories": [
      "japan"
    ],
    "primaryCategory": "japan",
    "seatInfo": {
      "seatTypeName": "パノラマ自由"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ローソンチケット",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2018-03-24_5",
    "date": "2018-03-24",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "marines",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 9,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 177,
    "pitchers": {
      "homeStarter": "ジー",
      "awayStarter": "ボルシンガー"
    },
    "homeRuns": [
      "ビシエド",
      "ビシエド",
      "アルモンテ"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D内野応援"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2018-04-03_8",
    "date": "2018-04-03",
    "time": "18:15",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 10,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 205,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "山口俊"
    },
    "homeRuns": [],
    "events": "オープニングシリーズ2018",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2018-07-31_9",
    "date": "2018-07-31",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 7,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 177,
    "pitchers": {
      "homeStarter": "ガルシア",
      "awayStarter": "岩貞"
    },
    "homeRuns": [
      "藤井"
    ],
    "notes": "大島洋平 2ラン犠飛（ガルシア・京田生還）",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_oth_2018-08-14_2",
    "date": "2018-08-14",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "hawks",
    "awayTeamId": "eagles",
    "stadiumId": "paypay_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "東浜",
      "awayStarter": "則本"
    },
    "homeRuns": [],
    "events": "パシフィックリーグ公式戦",
    "watchStatus": "watched",
    "cheerTeamId": "hawks",
    "categories": [
      "other"
    ],
    "primaryCategory": "other",
    "seatInfo": {
      "seatTypeName": "A指定席1塁側"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "プレイガイド",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "プレイガイド",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2018-08-31_10",
    "date": "2018-08-31",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 182,
    "pitchers": {
      "homeStarter": "笠原",
      "awayStarter": "メルセデス"
    },
    "homeRuns": [
      "アルモンテ"
    ],
    "notes": "ビシエド 月間最多安打(47安打)",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2018-09-24_11",
    "date": "2018-09-24",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 214,
    "pitchers": {
      "homeStarter": "吉見",
      "awayStarter": "大下"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2019-03-21_12",
    "date": "2019-03-21",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "buffaloes",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 7,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 187,
    "pitchers": {
      "homeStarter": "ロメロ",
      "awayStarter": "松葉"
    },
    "homeRuns": [
      "ビシエド",
      "堂上"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2019-04-02_14",
    "date": "2019-04-02",
    "time": "18:15",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 7,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 194,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "ジョンソン"
    },
    "homeRuns": [],
    "events": "オープニングシリーズ2019",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "57",
      "seatNumber": "181"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2019-04-29_15",
    "date": "2019-04-29",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 203,
    "pitchers": {
      "homeStarter": "阿知羅",
      "awayStarter": "青柳"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2019-07-26_16",
    "date": "2019-07-26",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 185,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "平良"
    },
    "homeRuns": [
      "ビシエド"
    ],
    "events": "夏の竜陣祭2019",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "44",
      "seatNumber": "625"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2019-07-28_17",
    "date": "2019-07-28",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 163,
    "pitchers": {
      "homeStarter": "笠原",
      "awayStarter": "中川虎"
    },
    "homeRuns": [],
    "events": "夏の竜陣祭2019",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2019-08-12_18",
    "date": "2019-08-12",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 150,
    "pitchers": {
      "homeStarter": "梅津",
      "awayStarter": "ガルシア"
    },
    "homeRuns": [
      "堂上"
    ],
    "notes": "梅津晃大 プロ初登板初先発初勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA"
    },
    "companions": "杉浦, 小山, 北川",
    "costInfo": {
      "totalPrice": 500,
      "myExpense": 500,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2019-09-16_21",
    "date": "2019-09-16",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 8,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 193,
    "pitchers": {
      "homeStarter": "山本",
      "awayStarter": "石田"
    },
    "homeRuns": [],
    "events": "マスコットデー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2020-09-19_22",
    "date": "2020-09-19",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 168,
    "pitchers": {
      "homeStarter": "福谷",
      "awayStarter": "秋山"
    },
    "homeRuns": [
      "阿部"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野B"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2020-09-21_23",
    "date": "2020-09-21",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 9,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 197,
    "pitchers": {
      "homeStarter": "勝野",
      "awayStarter": "山中"
    },
    "homeRuns": [
      "アルモンテ"
    ],
    "events": "昇竜2020",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2021-03-07_24",
    "date": "2021-03-07",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "eagles",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 162,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "早川"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野A",
      "row": "8",
      "seatNumber": "142"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 2000,
      "myExpense": 2000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2021-03-21_25",
    "date": "2021-03-21",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "fighters",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 9,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 191,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "北浦"
    },
    "homeRuns": [
      "福留",
      "大島"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野S",
      "row": "25",
      "seatNumber": "49"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2021-03-30_27",
    "date": "2021-03-30",
    "time": "18:15",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 184,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "サンチェス"
    },
    "homeRuns": [],
    "events": "オープニングシリーズ2021",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2021-03-31_28",
    "date": "2021-03-31",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 185,
    "pitchers": {
      "homeStarter": "勝野",
      "awayStarter": "井納"
    },
    "homeRuns": [],
    "events": "オープニングシリーズ2021",
    "notes": "根尾昂 プロ初打点",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野B",
      "row": "37",
      "seatNumber": "283"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 4800,
      "myExpense": 4800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2021-05-04_29",
    "date": "2021-05-04",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 8,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 160,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "大貫"
    },
    "homeRuns": [
      "根尾"
    ],
    "events": "ファミリーシリーズ2021",
    "notes": "根尾昂 プロ初本塁打は満塁弾",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2021-08-01_31",
    "date": "2021-08-01",
    "time": "13:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "fighters",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 178,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "池田"
    },
    "homeRuns": [],
    "events": "エキシビジョンマッチ",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野A",
      "row": "20",
      "seatNumber": "182"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2021-08-08_32",
    "date": "2021-08-08",
    "time": "13:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "lions",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 146,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "本田"
    },
    "homeRuns": [],
    "events": "エキシビジョンマッチ",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野S",
      "row": "32",
      "seatNumber": "22"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 3000,
      "myExpense": 3000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2021-08-22_33",
    "date": "2021-08-22",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 136,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "秋山"
    },
    "homeRuns": [],
    "events": "昇竜2021",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "56",
      "seatNumber": "282"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2021-09-23_34",
    "date": "2021-09-23",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 166,
    "pitchers": {
      "homeStarter": "笠原",
      "awayStarter": "伊藤将"
    },
    "homeRuns": [],
    "events": "昇竜2021",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマB",
      "row": "55",
      "seatNumber": "451"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2022-03-06_35",
    "date": "2022-03-06",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 135,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "奥川"
    },
    "homeRuns": [
      "加藤翔"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野A",
      "row": "9",
      "seatNumber": "228"
    },
    "companions": "柳川",
    "costInfo": {
      "totalPrice": 2000,
      "myExpense": 2000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2022-03-19_36",
    "date": "2022-03-19",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "eagles",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 168,
    "pitchers": {
      "homeStarter": "勝野",
      "awayStarter": "岸"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野S",
      "row": "32",
      "seatNumber": "31"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2022-03-20_37",
    "date": "2022-03-20",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "marines",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 181,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "ロメロ"
    },
    "homeRuns": [
      "木下拓"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野B",
      "row": "13",
      "seatNumber": "289"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 1000,
      "myExpense": 1000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2022-03-29_38",
    "date": "2022-03-29",
    "time": "18:15",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 169,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "ロメロ"
    },
    "homeRuns": [],
    "events": "オープニングシリーズ2022",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "53",
      "seatNumber": "101"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2022-04-29_39",
    "date": "2022-04-29",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 170,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "大瀬良"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "39",
      "seatNumber": "603"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.049Z",
    "updatedAt": "2026-11-05T16:55:22.049Z"
  },
  {
    "id": "excel_d1_2022-06-19_40",
    "date": "2022-06-19",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 190,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "シューメーカー"
    },
    "homeRuns": [
      "A.マルティネス",
      "高橋周"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "57",
      "seatNumber": "293"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2022-08-07_42",
    "date": "2022-08-07",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 175,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "ロメロ"
    },
    "homeRuns": [
      "石垣"
    ],
    "events": "昇竜2022",
    "notes": "岡林勇希 2度のレーザービーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "53",
      "seatNumber": "101"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-03-03_43",
    "date": "2023-03-03",
    "time": "19:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "japan_national",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 7,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 206,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "今永"
    },
    "homeRuns": [
      "アキーノ"
    ],
    "events": "侍ジャパンシリーズ2023名古屋",
    "notes": "侍ジャパン相手に7得点勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "52",
      "seatNumber": "264"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_jp_2023-03-03_3",
    "date": "2023-03-03",
    "time": "19:00",
    "isDateUnknown": false,
    "homeTeamId": "japan_national",
    "awayTeamId": "dragons",
    "stadiumId": "vantelin_dome",
    "matchType": "international",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 7,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "今永"
    },
    "homeRuns": [],
    "events": "カーネクスト侍ジャパンシリーズ2023 名古屋",
    "notes": "2023侍ジャパン 唯一の敗戦",
    "watchStatus": "watched",
    "cheerTeamId": "japan_national",
    "categories": [
      "japan"
    ],
    "primaryCategory": "japan",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "52",
      "seatNumber": "264"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ローソンチケット",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2023-03-04_44",
    "date": "2023-03-04",
    "time": "19:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "japan_national",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 168,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "佐々木朗"
    },
    "homeRuns": [
      "アキーノ"
    ],
    "events": "侍ジャパンシリーズ2023名古屋",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野B",
      "row": "31",
      "seatNumber": "423"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_jp_2023-03-04_4",
    "date": "2023-03-04",
    "time": "19:00",
    "isDateUnknown": false,
    "homeTeamId": "japan_national",
    "awayTeamId": "dragons",
    "stadiumId": "vantelin_dome",
    "matchType": "international",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "佐々木朗"
    },
    "homeRuns": [
      "岡本"
    ],
    "events": "カーネクスト侍ジャパンシリーズ2023 名古屋",
    "watchStatus": "watched",
    "cheerTeamId": "japan_national",
    "categories": [
      "japan"
    ],
    "primaryCategory": "japan",
    "seatInfo": {
      "seatTypeName": "内野B",
      "row": "31",
      "seatNumber": "423"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ローソンチケット",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_jp_2023-03-11_6",
    "date": "2023-03-11",
    "time": "19:00",
    "isDateUnknown": false,
    "homeTeamId": "japan_national",
    "awayTeamId": "czech",
    "stadiumId": "tokyo_dome",
    "matchType": "international",
    "matchStatus": "finished",
    "homeScore": 10,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "佐々木朗"
    },
    "homeRuns": [
      "牧"
    ],
    "events": "2023 WORLD BASEBALL CLASSIC 1次R・プールB",
    "watchStatus": "watched",
    "cheerTeamId": "japan_national",
    "categories": [
      "japan"
    ],
    "primaryCategory": "japan",
    "seatInfo": {
      "seatTypeName": "指定席B",
      "row": "16",
      "seatNumber": "468"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ローソンチケット",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2023-03-12_45",
    "date": "2023-03-12",
    "time": "13:00",
    "isDateUnknown": false,
    "homeTeamId": "baystars",
    "awayTeamId": "dragons",
    "stadiumId": "yokohama",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 8,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 187,
    "pitchers": {
      "homeStarter": "東",
      "awayStarter": "福谷"
    },
    "homeRuns": [
      "アキーノ"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "V外野応援",
      "row": "10",
      "seatNumber": "582"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-03-14_46",
    "date": "2023-03-14",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 173,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "遠藤"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "37",
      "seatNumber": "603"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-03-17_47",
    "date": "2023-03-17",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "eagles",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 194,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "田中将"
    },
    "homeRuns": [
      "アキーノ"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野S",
      "row": "9",
      "seatNumber": "222"
    },
    "companions": "加藤大",
    "costInfo": {
      "totalPrice": 2000,
      "myExpense": 2000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-03-18_48",
    "date": "2023-03-18",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "eagles",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 6,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 187,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "藤平"
    },
    "homeRuns": [],
    "notes": "平田良介 引退試合",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野A",
      "row": "21",
      "seatNumber": "323"
    },
    "companions": "柳川",
    "costInfo": {
      "totalPrice": 1300,
      "myExpense": 1300,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-03-25_49",
    "date": "2023-03-25",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "marines",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 139,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "種市"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野S",
      "row": "11",
      "seatNumber": "223"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-04-04_50",
    "date": "2023-04-04",
    "time": "18:15",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 145,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "サイスニード"
    },
    "homeRuns": [],
    "events": "オープニングシリーズ2023",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "56",
      "seatNumber": "181"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-04-29_51",
    "date": "2023-04-29",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 7,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 189,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "大貫"
    },
    "homeRuns": [],
    "events": "昇竜2023",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "56",
      "seatNumber": "381"
    },
    "companions": "板垣",
    "costInfo": {
      "totalPrice": 3500,
      "myExpense": 3500,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-05-07_52",
    "date": "2023-05-07",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 179,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "赤星"
    },
    "homeRuns": [],
    "events": "ファミリーシリーズ2023",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "プライムツインB",
      "row": "2",
      "seatNumber": "57"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-05-10_53",
    "date": "2023-05-10",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 197,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "九里"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "52",
      "seatNumber": "141"
    },
    "companions": "水谷, 鳥居",
    "costInfo": {
      "totalPrice": 1000,
      "myExpense": 1000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-05-26_55",
    "date": "2023-05-26",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 155,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "ガゼルマン"
    },
    "homeRuns": [
      "石川昂"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "42",
      "seatNumber": "623"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-06-17_56",
    "date": "2023-06-17",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "fighters",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 163,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "伊藤大"
    },
    "homeRuns": [],
    "events": "交流戦ウィーク",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "53",
      "seatNumber": "301"
    },
    "companions": "伊藤陵",
    "costInfo": {
      "totalPrice": 2500,
      "myExpense": 2500,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-06-23_57",
    "date": "2023-06-23",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 161,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "サイスニード"
    },
    "homeRuns": [],
    "events": "FCスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマDP",
      "row": "53",
      "seatNumber": "50"
    },
    "companions": "水谷, 瓜生",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-07-09_59",
    "date": "2023-07-09",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 184,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "森"
    },
    "homeRuns": [
      "福田"
    ],
    "events": "夏の竜陣祭2023",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "58",
      "seatNumber": "261"
    },
    "companions": "杉浦",
    "costInfo": {
      "totalPrice": 3500,
      "myExpense": 3500,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_oth_2023-07-19_3",
    "date": "2023-07-19",
    "time": "18:30",
    "isDateUnknown": false,
    "homeTeamId": "tigers",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 8,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "村上",
      "awayStarter": "佐々木朗"
    },
    "homeRuns": [
      "柳田（PL）"
    ],
    "events": "マイナビオールスターゲーム2023",
    "watchStatus": "watched",
    "cheerTeamId": "tigers",
    "categories": [
      "other"
    ],
    "primaryCategory": "other",
    "seatInfo": {
      "seatTypeName": "パノラマA"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "プレイガイド",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "プレイガイド",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2023-08-01_61",
    "date": "2023-08-01",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 10,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 200,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "西純"
    },
    "homeRuns": [
      "細川"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "37",
      "seatNumber": "602"
    },
    "companions": "鈴木",
    "costInfo": {
      "totalPrice": 3000,
      "myExpense": 3000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-08-04_62",
    "date": "2023-08-04",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 11,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 200,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "サイスニード"
    },
    "homeRuns": [
      "細川",
      "宇佐見",
      "細川"
    ],
    "events": "キッズサマーシリーズ",
    "notes": "細川成也 誕生日に2HR, 6打点",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "42",
      "seatNumber": "592"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-08-15_65",
    "date": "2023-08-15",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "cancelled",
    "homeScore": null,
    "awayScore": null,
    "isScoreConfirmed": false,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "（小笠原）",
      "awayStarter": "（菅野）"
    },
    "homeRuns": [],
    "notes": "台風接近により中止",
    "watchStatus": "cancelled",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "41",
      "seatNumber": "583"
    },
    "companions": "戸名, 竹内",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "cancelled_refund",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_oth_2023-08-18_6",
    "date": "2023-08-18",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "buffaloes",
    "awayTeamId": "fighters",
    "stadiumId": "other_stadium",
    "stadiumCustom": "京セラドーム",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "山下",
      "awayStarter": "上沢"
    },
    "homeRuns": [],
    "events": "パシフィックリーグ公式戦",
    "watchStatus": "watched",
    "cheerTeamId": "buffaloes",
    "categories": [
      "other"
    ],
    "primaryCategory": "other",
    "seatInfo": {
      "seatTypeName": "S指定席"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "プレイガイド",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "プレイガイド",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2023-08-31_67",
    "date": "2023-08-31",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 179,
    "pitchers": {
      "homeStarter": "梅津",
      "awayStarter": "小川"
    },
    "homeRuns": [
      "木下拓"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "602"
    },
    "companions": "岡",
    "costInfo": {
      "totalPrice": 2000,
      "myExpense": 2000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-09-15_68",
    "date": "2023-09-15",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 7,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 161,
    "pitchers": {
      "homeStarter": "仲地",
      "awayStarter": "戸郷"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "602"
    },
    "companions": "中村, 水野, 鈴木",
    "costInfo": {
      "totalPrice": 2000,
      "myExpense": 2000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d2_2023-09-15_2",
    "date": "2023-09-15",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "hawks",
    "stadiumId": "nagoya_stadium",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 185,
    "pitchers": {
      "homeStarter": "上田",
      "awayStarter": "松本晴"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "自由席"
    },
    "companions": "中村",
    "costInfo": {
      "totalPrice": 2000,
      "myExpense": 2000,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2023-09-17_71",
    "date": "2023-09-17",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 182,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "九里"
    },
    "homeRuns": [],
    "events": "チアドラデー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "53",
      "seatNumber": "193"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 2500,
      "myExpense": 2500,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-09-18_73",
    "date": "2023-09-18",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 8,
    "awayScore": 7,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 270,
    "pitchers": {
      "homeStarter": "根尾",
      "awayStarter": "森"
    },
    "homeRuns": [
      "ビシエド"
    ],
    "events": "ＦＣスペシャルゲーム",
    "notes": "根尾昂 本拠地初先発",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野B",
      "row": "29",
      "seatNumber": "402"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-09-22_75",
    "date": "2023-09-22",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "baystars",
    "awayTeamId": "dragons",
    "stadiumId": "yokohama",
    "matchType": "official",
    "matchStatus": "cancelled",
    "homeScore": null,
    "awayScore": null,
    "isScoreConfirmed": false,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "平良",
      "awayStarter": "仲地"
    },
    "homeRuns": [],
    "notes": "3回ウラ途中雨天ノーゲーム(DB 0-1 D)",
    "watchStatus": "cancelled",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "V外野応援",
      "row": "16",
      "seatNumber": "560"
    },
    "companions": "戸名",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "cancelled_refund",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-09-25_76",
    "date": "2023-09-25",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 152,
    "pitchers": {
      "homeStarter": "梅津",
      "awayStarter": "村上"
    },
    "homeRuns": [],
    "events": "ファイナルシリーズ2023",
    "notes": "梅津晃大 1177日ぶりの復活勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "53",
      "seatNumber": "171"
    },
    "companions": "板垣, 水谷, 鳥居",
    "costInfo": {
      "totalPrice": 2500,
      "myExpense": 2500,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2023-10-03_79",
    "date": "2023-10-03",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 177,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "赤星"
    },
    "homeRuns": [],
    "events": "本拠地最終戦",
    "notes": "谷元・大野奨・福田・堂上引退試合",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野B",
      "row": "40",
      "seatNumber": "384"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 3800,
      "myExpense": 3800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-02-21_81",
    "date": "2024-02-21",
    "time": "13:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "marines",
    "stadiumId": "chatan",
    "stadiumCustom": "Agreスタジアム北谷",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 14,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 179,
    "pitchers": {
      "homeStarter": "梅津",
      "awayStarter": "二木"
    },
    "homeRuns": [
      "鵜飼"
    ],
    "events": "練習試合",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野席"
    },
    "companions": "水谷, 柳川",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-02-23_83",
    "date": "2024-02-23",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "chatan",
    "stadiumCustom": "Agreスタジアム北谷",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 10,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 181,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "益田"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "外野席(ライト)"
    },
    "companions": "水谷, 柳川",
    "costInfo": {
      "totalPrice": 3660,
      "myExpense": 1220,
      "paymentDestination": "イープラス",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "イープラス",
      "ticketType": "電子チケット",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-03-02_85",
    "date": "2024-03-02",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 167,
    "pitchers": {
      "homeStarter": "根尾",
      "awayStarter": "小川"
    },
    "homeRuns": [
      "細川"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "seatNumber": "573"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 5600,
      "myExpense": 800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-03-06_86",
    "date": "2024-03-06",
    "time": "12:00",
    "isDateUnknown": false,
    "homeTeamId": "buffaloes",
    "awayTeamId": "dragons",
    "stadiumId": "other_stadium",
    "stadiumCustom": "京セラドーム",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 189,
    "pitchers": {
      "homeStarter": "東",
      "awayStarter": "柳"
    },
    "homeRuns": [
      "中田"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "ビジター下段",
      "row": "25",
      "seatNumber": "581"
    },
    "companions": "中村",
    "costInfo": {
      "totalPrice": 2000,
      "myExpense": 0,
      "paymentDestination": "オリチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "オリチケ",
      "ticketType": "電子チケット",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_jp_2024-03-06_7",
    "date": "2024-03-06",
    "time": "19:00",
    "isDateUnknown": false,
    "homeTeamId": "japan_national",
    "awayTeamId": "tigers",
    "stadiumId": "other_stadium",
    "stadiumCustom": "京セラドーム",
    "matchType": "international",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "平良"
    },
    "homeRuns": [],
    "events": "カーネクスト侍ジャパンシリーズ2024",
    "watchStatus": "watched",
    "cheerTeamId": "japan_national",
    "categories": [
      "japan"
    ],
    "primaryCategory": "japan",
    "seatInfo": {
      "seatTypeName": "指定席B",
      "row": "20",
      "seatNumber": "432"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ローソンチケット",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2024-03-15_87",
    "date": "2024-03-15",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 177,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "青柳"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "34",
      "seatNumber": "584"
    },
    "companions": "岡",
    "costInfo": {
      "totalPrice": 1600,
      "myExpense": 800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-03-16_88",
    "date": "2024-03-16",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 198,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "大竹"
    },
    "homeRuns": [
      "石川昂",
      "細川"
    ],
    "notes": "細川成也 左翼5階席に叩きこむ衝撃弾",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野S",
      "row": "32",
      "seatNumber": "141"
    },
    "companions": "鈴木, 竹内, 田中, 戸名, 森岡",
    "costInfo": {
      "totalPrice": 12600,
      "myExpense": 2100,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 6
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-03-19_98",
    "date": "2024-03-19",
    "time": "13:00",
    "isDateUnknown": false,
    "homeTeamId": "eagles",
    "awayTeamId": "dragons",
    "stadiumId": "other_stadium",
    "stadiumCustom": "岡崎",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 181,
    "pitchers": {
      "homeStarter": "ポンセ",
      "awayStarter": "仲地"
    },
    "homeRuns": [],
    "notes": "7年ぶり岡崎開催で勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "外野席(ライト)"
    },
    "companions": "水谷, 後藤",
    "costInfo": {
      "totalPrice": 5640,
      "myExpense": 1830,
      "paymentDestination": "イープラス",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "イープラス",
      "ticketType": "ファミリーマート",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-03-20_100",
    "date": "2024-03-20",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "eagles",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 148,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "岸"
    },
    "homeRuns": [
      "細川"
    ],
    "notes": "細川成也 今月2度目の5階席弾",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野S",
      "row": "36",
      "seatNumber": "173"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 9600,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 4
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-03-23_101",
    "date": "2024-03-23",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "marines",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 165,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "種市"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "604"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 1600,
      "myExpense": 800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-03-29_102",
    "date": "2024-03-29",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "swallows",
    "awayTeamId": "dragons",
    "stadiumId": "jingu",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 7,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 223,
    "pitchers": {
      "homeStarter": "サイスニード",
      "awayStarter": "柳"
    },
    "homeRuns": [
      "中田"
    ],
    "events": "プロ野球開幕戦",
    "notes": "柳裕也 初の開幕投手 ",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "外野指定席B",
      "seatNumber": "2"
    },
    "companions": "後藤",
    "costInfo": {
      "totalPrice": 6400,
      "myExpense": 3200,
      "paymentDestination": "スワチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "スワチケ",
      "ticketType": "電子チケット",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-03-30_103",
    "date": "2024-03-30",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "swallows",
    "awayTeamId": "dragons",
    "stadiumId": "jingu",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 283,
    "pitchers": {
      "homeStarter": "吉村",
      "awayStarter": "涌井"
    },
    "homeRuns": [],
    "notes": "涌井秀章 2000奪三振達成",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "外野指定席B",
      "seatNumber": "3"
    },
    "companions": "後藤",
    "costInfo": {
      "totalPrice": 6400,
      "myExpense": 3200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-04-02_104",
    "date": "2024-04-02",
    "time": "18:15",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 206,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "山崎伊"
    },
    "homeRuns": [
      "細川"
    ],
    "events": "オープニングシリーズ2024",
    "notes": "細川成也 今季初ヒットがサヨナラホームラン",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "54",
      "seatNumber": "312"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 15600,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 4
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-04-04_105",
    "date": "2024-04-04",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 165,
    "pitchers": {
      "homeStarter": "梅津",
      "awayStarter": "菅野"
    },
    "homeRuns": [],
    "events": "オープニングシリーズ2024",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "40",
      "seatNumber": "583"
    },
    "companions": "水谷, 高木",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-04-13_107",
    "date": "2024-04-13",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 164,
    "pitchers": {
      "homeStarter": "メヒア",
      "awayStarter": "大竹"
    },
    "homeRuns": [],
    "events": "昇竜2024",
    "notes": "4年ぶりの6連勝",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "seatNumber": "531"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 5200,
      "myExpense": 3410,
      "paymentDestination": "ローチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-04-17_108",
    "date": "2024-04-17",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 166,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "小澤"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "30",
      "seatNumber": "563"
    },
    "companions": "鈴木",
    "costInfo": {
      "totalPrice": 3600,
      "myExpense": 1800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-04-27_109",
    "date": "2024-04-27",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 201,
    "pitchers": {
      "homeStarter": "梅津",
      "awayStarter": "森下"
    },
    "homeRuns": [
      "上林",
      "カリステ",
      "細川"
    ],
    "events": "竜陣祭2024",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "612"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 5520,
      "myExpense": 2760,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-04-29_112",
    "date": "2024-04-29",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 11,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 181,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "ジャクソン"
    },
    "homeRuns": [
      "木下拓",
      "細川"
    ],
    "events": "竜陣祭2024",
    "notes": "細川成也 プロ初の満塁ホームラン",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野SS",
      "row": "19",
      "seatNumber": "105"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-04-30_114",
    "date": "2024-04-30",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 184,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "中川颯"
    },
    "homeRuns": [],
    "events": "竜陣祭2024",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "41",
      "seatNumber": "591"
    },
    "companions": "水谷, 高木",
    "costInfo": {
      "totalPrice": 6600,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-05-01_116",
    "date": "2024-05-01",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 12,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 180,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "石田健"
    },
    "homeRuns": [
      "細川"
    ],
    "events": "竜陣祭2024",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "53",
      "seatNumber": "221"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 8100,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-05-08_117",
    "date": "2024-05-08",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 187,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "堀田"
    },
    "homeRuns": [],
    "events": "FCスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野S",
      "row": "7",
      "seatNumber": "224"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 1470,
      "myExpense": 1470,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-05-16_118",
    "date": "2024-05-16",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 9,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 193,
    "pitchers": {
      "homeStarter": "梅津",
      "awayStarter": "西勇"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "31",
      "seatNumber": "582"
    },
    "companions": "後藤",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-05-26_119",
    "date": "2024-05-26",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 192,
    "pitchers": {
      "homeStarter": "仲地",
      "awayStarter": "松本健"
    },
    "homeRuns": [],
    "events": "マスコットデー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "40",
      "seatNumber": "604"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-05-29_120",
    "date": "2024-05-29",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "lions",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 158,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "隅田"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D内野応援",
      "row": "42",
      "seatNumber": "422"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 1700,
      "myExpense": 1700,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-05-30_121",
    "date": "2024-05-30",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "lions",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 187,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "武内"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "34",
      "seatNumber": "583"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 3600,
      "myExpense": 1800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-06-01_122",
    "date": "2024-06-01",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "buffaloes",
    "awayTeamId": "dragons",
    "stadiumId": "other_stadium",
    "stadiumCustom": "京セラドーム",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 185,
    "pitchers": {
      "homeStarter": "東",
      "awayStarter": "メヒア"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "ビジター下段",
      "row": "20",
      "seatNumber": "564"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 5000,
      "myExpense": 2500,
      "paymentDestination": "オリチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "オリチケ",
      "ticketType": "電子/京セラ",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-06-04_123",
    "date": "2024-06-04",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "hawks",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 207,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "有原"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "39",
      "seatNumber": "571"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 4620,
      "myExpense": 2310,
      "paymentDestination": "セブンチケット",
      "paymentMethod": "セブンイレブン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "セブンチケット",
      "ticketType": "セブンイレブン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-06-05_124",
    "date": "2024-06-05",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "hawks",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 184,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "大関"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "31",
      "seatNumber": "583"
    },
    "companions": "高木",
    "costInfo": {
      "totalPrice": 4700,
      "myExpense": 2350,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-06-07_125",
    "date": "2024-06-07",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "eagles",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 172,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "早川"
    },
    "homeRuns": [],
    "events": "ガールズシリーズ2024",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "55",
      "seatNumber": "188"
    },
    "companions": "水谷",
    "costInfo": {
      "totalPrice": 1400,
      "myExpense": 1400,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-06-22_126",
    "date": "2024-06-22",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 186,
    "pitchers": {
      "homeStarter": "メヒア",
      "awayStarter": "大瀬良"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "41",
      "seatNumber": "603"
    },
    "companions": "水谷",
    "costInfo": {
      "totalPrice": 5100,
      "myExpense": 2550,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-06-23_127",
    "date": "2024-06-23",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 176,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "玉村"
    },
    "homeRuns": [],
    "events": "FCスペシャルゲーム",
    "notes": "松山晋也 バースデー勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "41",
      "seatNumber": "591"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-06-29_128",
    "date": "2024-06-29",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 158,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "東"
    },
    "homeRuns": [],
    "events": "昇竜2024",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野B",
      "row": "45",
      "seatNumber": "344"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 17600,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 4
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-07-07_129",
    "date": "2024-07-07",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 142,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "玉村"
    },
    "homeRuns": [],
    "events": "ブルーサマーフェスティバル2024",
    "notes": "板山祐太郎 サヨナラタイムリー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "40",
      "seatNumber": "609"
    },
    "companions": "水野, 鈴木",
    "costInfo": {
      "totalPrice": 6600,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-07-14_131",
    "date": "2024-07-14",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 241,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "西勇"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "39",
      "seatNumber": "604"
    },
    "companions": "瓜生",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-07-20_132",
    "date": "2024-07-20",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 182,
    "pitchers": {
      "homeStarter": "メヒア",
      "awayStarter": "グリフィン"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "39",
      "seatNumber": "668"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-07-21_133",
    "date": "2024-07-21",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 180,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "菅野"
    },
    "homeRuns": [
      "中田"
    ],
    "events": "FCスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "40",
      "seatNumber": "565"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_oth_2024-07-25_7",
    "date": "2024-07-25",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "tigers",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "鈴木孝",
      "awayStarter": "小松"
    },
    "homeRuns": [],
    "events": "DRAGONS CLASSIC LEGEND GAME2024",
    "watchStatus": "watched",
    "cheerTeamId": "tigers",
    "categories": [
      "other"
    ],
    "primaryCategory": "other",
    "seatInfo": {
      "seatTypeName": "バックネット裏",
      "row": "17",
      "seatNumber": "7"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 5000,
      "myExpense": 5000,
      "paymentDestination": "プレイガイド",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "プレイガイド",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2024-07-31_134",
    "date": "2024-07-31",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 167,
    "pitchers": {
      "homeStarter": "松木平",
      "awayStarter": "サイスニード"
    },
    "homeRuns": [],
    "events": "ワンコインデー",
    "notes": "松木平優太 プロ初勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野S",
      "row": "9",
      "seatNumber": "209"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 900,
      "myExpense": 900,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-08-08_135",
    "date": "2024-08-08",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 163,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "ジャクソン"
    },
    "homeRuns": [
      "石川昂"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "602"
    },
    "companions": "水野, 竹内",
    "costInfo": {
      "totalPrice": 1800,
      "myExpense": 1800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d2_2024-08-08_3",
    "date": "2024-08-08",
    "time": "10:20",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "hawks",
    "stadiumId": "vantelin_dome",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 6,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 161,
    "pitchers": {
      "homeStarter": "岡田",
      "awayStarter": "前田悠"
    },
    "homeRuns": [
      "川越"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "バックネット裏自由",
      "row": "17",
      "seatNumber": "46"
    },
    "companions": "水野, 竹内",
    "costInfo": {
      "totalPrice": 1800,
      "myExpense": 1800,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2024-08-11_137",
    "date": "2024-08-11",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 187,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "菅野"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "ゆったりボックス3",
      "row": "47",
      "seatNumber": "330"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 20100,
      "myExpense": 0,
      "paymentDestination": "ローチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-08-17_138",
    "date": "2024-08-17",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 285,
    "pitchers": {
      "homeStarter": "メヒア",
      "awayStarter": "村上"
    },
    "homeRuns": [],
    "events": "FCスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "パノラマA",
      "row": "53",
      "seatNumber": "130"
    },
    "companions": "水野, 竹内, 戸名, 山口",
    "costInfo": {
      "totalPrice": 20120,
      "myExpense": 4120,
      "paymentDestination": "ローチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 5
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-08-22_142",
    "date": "2024-08-22",
    "time": "17:45",
    "isDateUnknown": false,
    "homeTeamId": "baystars",
    "awayTeamId": "dragons",
    "stadiumId": "yokohama",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 8,
    "awayScore": 9,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 219,
    "pitchers": {
      "homeStarter": "ジャクソン",
      "awayStarter": "松葉"
    },
    "homeRuns": [],
    "notes": "17年ぶり 6点差逆転勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "V外野応援",
      "row": "8",
      "seatNumber": "547"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 4620,
      "myExpense": 2410,
      "paymentDestination": "ベイチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ベイチケ",
      "ticketType": "セブンイレブン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-08-23_143",
    "date": "2024-08-23",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "giants",
    "awayTeamId": "dragons",
    "stadiumId": "tokyo_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 8,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 165,
    "pitchers": {
      "homeStarter": "西舘",
      "awayStarter": "福谷"
    },
    "homeRuns": [
      "宇佐見"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "V応援席",
      "row": "2",
      "seatNumber": "531"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 4600,
      "myExpense": 2630,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-08-24_144",
    "date": "2024-08-24",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "giants",
    "awayTeamId": "dragons",
    "stadiumId": "tokyo_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 6,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 184,
    "pitchers": {
      "homeStarter": "井上",
      "awayStarter": "柳"
    },
    "homeRuns": [
      "ブライト"
    ],
    "notes": "ブライト健太 プロ初ホームラン",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "V応援席",
      "row": "7",
      "seatNumber": "541"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 5200,
      "myExpense": 2930,
      "paymentDestination": "ローチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-08-28_145",
    "date": "2024-08-28",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 151,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "床田"
    },
    "homeRuns": [
      "カリステ"
    ],
    "events": "ワンコインデー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "40",
      "seatNumber": "589"
    },
    "companions": "加藤大",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-08-29_146",
    "date": "2024-08-29",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 166,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "九里"
    },
    "homeRuns": [
      "宇佐見",
      "細川"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野S",
      "row": "43",
      "seatNumber": "154"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 3200,
      "myExpense": 3200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-09-01_148",
    "date": "2024-09-01",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "cancelled",
    "homeScore": null,
    "awayScore": null,
    "isScoreConfirmed": false,
    "matchDurationMinutes": null,
    "pitchers": {},
    "homeRuns": [],
    "events": "どらエールシリーズ2024",
    "notes": "台風接近により中止",
    "watchStatus": "cancelled",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "34",
      "seatNumber": "507"
    },
    "companions": "竹内, 鈴木",
    "costInfo": {
      "totalPrice": 9615,
      "myExpense": 0,
      "paymentDestination": "ローチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "cancelled_refund",
      "vendor": "ローチケ",
      "ticketType": "電子チケット",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-09-05_150",
    "date": "2024-09-05",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "tigers",
    "awayTeamId": "dragons",
    "stadiumId": "koshien",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 215,
    "pitchers": {
      "homeStarter": "大竹",
      "awayStarter": "大野雄"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "V専用応援席",
      "row": "47",
      "seatNumber": "113"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 1800,
      "myExpense": 1800,
      "paymentDestination": "チケットぴあ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "チケットぴあ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-09-12_151",
    "date": "2024-09-12",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 9,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 246,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "サイスニード"
    },
    "homeRuns": [
      "福永"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "583"
    },
    "companions": "水谷, 後藤, 柳川",
    "costInfo": {
      "totalPrice": 5400,
      "myExpense": 1800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-09-18_154",
    "date": "2024-09-18",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 8,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 225,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "村上"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "37",
      "seatNumber": "603"
    },
    "companions": "岡",
    "costInfo": {
      "totalPrice": 5500,
      "myExpense": 2750,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "バンテリン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-09-22_155",
    "date": "2024-09-22",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 179,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "森下"
    },
    "homeRuns": [],
    "events": "サンクスシリーズ2024",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "28",
      "seatNumber": "507"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 5830,
      "myExpense": 2805,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-09-23_156",
    "date": "2024-09-23",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 141,
    "pitchers": {
      "homeStarter": "松木平",
      "awayStarter": "森"
    },
    "homeRuns": [],
    "events": "サンクスシリーズ2024",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "44",
      "seatNumber": "506"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 6630,
      "myExpense": 3205,
      "paymentDestination": "ローチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-10-04_157",
    "date": "2024-10-04",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 174,
    "pitchers": {
      "homeStarter": "梅津",
      "awayStarter": "濱口"
    },
    "homeRuns": [],
    "events": "加藤翔平・砂田毅樹 引退セレモニー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "587"
    },
    "companions": "高木",
    "costInfo": {
      "totalPrice": 5610,
      "myExpense": 2805,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-10-05_158",
    "date": "2024-10-05",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 211,
    "pitchers": {
      "homeStarter": "小笠原",
      "awayStarter": "松本隆"
    },
    "homeRuns": [
      "細川"
    ],
    "events": "田島慎二 引退セレモニー",
    "notes": "福永裕基 サヨナラタイムリー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "40",
      "seatNumber": "561"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 14020,
      "myExpense": 2805,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2024-10-06_160",
    "date": "2024-10-06",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 166,
    "pitchers": {
      "homeStarter": "松木平",
      "awayStarter": "大貫"
    },
    "homeRuns": [],
    "events": "本拠地最終戦",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "44",
      "seatNumber": "581"
    },
    "companions": "竹内, 鈴木",
    "costInfo": {
      "totalPrice": 5420,
      "myExpense": 3205,
      "paymentDestination": "各種プレイガイド",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "各種プレイガイド",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_jp_2024-11-09_8",
    "date": "2024-11-09",
    "time": "19:00",
    "isDateUnknown": false,
    "homeTeamId": "japan_national",
    "awayTeamId": "czech",
    "stadiumId": "vantelin_dome",
    "matchType": "international",
    "matchStatus": "finished",
    "homeScore": 7,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "髙橋宏"
    },
    "homeRuns": [
      "辰己"
    ],
    "events": "ラグザス 侍ジャパンシリーズ2024",
    "watchStatus": "watched",
    "cheerTeamId": "japan_national",
    "categories": [
      "japan"
    ],
    "primaryCategory": "japan",
    "seatInfo": {
      "seatTypeName": "外野応援（ライト）",
      "row": "40",
      "seatNumber": "601"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 4380,
      "myExpense": 4380,
      "paymentDestination": "ローソンチケット",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_jp_2024-11-10_9",
    "date": "2024-11-10",
    "time": "19:00",
    "isDateUnknown": false,
    "homeTeamId": "japan_national",
    "awayTeamId": "czech",
    "stadiumId": "vantelin_dome",
    "matchType": "international",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 9,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "早川"
    },
    "homeRuns": [
      "森下"
    ],
    "events": "ラグザス 侍ジャパンシリーズ2024",
    "watchStatus": "watched",
    "cheerTeamId": "japan_national",
    "categories": [
      "japan"
    ],
    "primaryCategory": "japan",
    "seatInfo": {
      "seatTypeName": "外野応援（ライト）",
      "row": "41",
      "seatNumber": "593"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 4380,
      "myExpense": 4380,
      "paymentDestination": "ローソンチケット",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_jp_2024-11-13_10",
    "date": "2024-11-13",
    "time": "19:00",
    "isDateUnknown": false,
    "homeTeamId": "japan_national",
    "awayTeamId": "australia",
    "stadiumId": "vantelin_dome",
    "matchType": "international",
    "matchStatus": "finished",
    "homeScore": 9,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "井上"
    },
    "homeRuns": [],
    "events": "ラグザス presents 第3回WBSCプレミア12",
    "watchStatus": "watched",
    "cheerTeamId": "japan_national",
    "categories": [
      "japan"
    ],
    "primaryCategory": "japan",
    "seatInfo": {
      "seatTypeName": "外野応援（ライト）",
      "row": "41",
      "seatNumber": "601"
    },
    "companions": "土屋",
    "costInfo": {
      "totalPrice": 4130,
      "myExpense": 4130,
      "paymentDestination": "ローソンチケット",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2025-02-18_162",
    "date": "2025-02-18",
    "time": "13:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "fighters",
    "stadiumId": "chatan",
    "stadiumCustom": "Agreスタジアム北谷",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 189,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "金村"
    },
    "homeRuns": [
      "福永"
    ],
    "events": "練習試合",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野席"
    },
    "companions": "加藤大",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2025-03-01_163",
    "date": "2025-03-01",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 153,
    "pitchers": {
      "homeStarter": "マラー",
      "awayStarter": "東"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "37",
      "seatNumber": "570"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 4000,
      "myExpense": 1000,
      "paymentDestination": "イープラス",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "イープラス",
      "ticketType": "ファミリーマート",
      "quantity": 4
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2025-03-02_164",
    "date": "2025-03-02",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 143,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "伊勢"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "39",
      "seatNumber": "568"
    },
    "companions": "鈴木, 竹内, 戸名",
    "costInfo": {
      "totalPrice": 5600,
      "myExpense": 1000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2025-03-08_167",
    "date": "2025-03-08",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "fighters",
    "awayTeamId": "dragons",
    "stadiumId": "other_stadium",
    "stadiumCustom": "エスコンF",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 6,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 204,
    "pitchers": {
      "homeStarter": "バーヘイゲン",
      "awayStarter": "マラー"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "ビジター応援",
      "seatNumber": "5"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 5760,
      "myExpense": 0,
      "paymentDestination": "ローチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2025-03-09_168",
    "date": "2025-03-09",
    "time": "13:00",
    "isDateUnknown": false,
    "homeTeamId": "fighters",
    "awayTeamId": "dragons",
    "stadiumId": "other_stadium",
    "stadiumCustom": "エスコンF",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 154,
    "pitchers": {
      "homeStarter": "伊藤大",
      "awayStarter": "メヒア"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "ビジター応援",
      "seatNumber": "2"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 5760,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2025-03-12_169",
    "date": "2025-03-12",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "buffaloes",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 149,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "宮城"
    },
    "homeRuns": [
      "上林"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "583"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 2000,
      "myExpense": 1000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d2_2025-03-12_5",
    "date": "2025-03-12",
    "time": "12:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "nagoya_stadium",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 176,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "伊藤将"
    },
    "homeRuns": [],
    "events": "春季教育リーグ",
    "notes": "板山祐太郎 サヨナラタイムリー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "自由席"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 1000,
      "myExpense": 1000,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2025-03-16_170",
    "date": "2025-03-16",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "lions",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 171,
    "pitchers": {
      "homeStarter": "マラー",
      "awayStarter": "髙橋光成"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "リビングボックス",
      "row": "45",
      "seatNumber": "368"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 7200,
      "myExpense": 0,
      "paymentDestination": "ローチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 4
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2025-03-21_171",
    "date": "2025-03-21",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "eagles",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 180,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "早川"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "583"
    },
    "companions": "岡, 竹内",
    "costInfo": {
      "totalPrice": 3000,
      "myExpense": 1000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2025-03-22_173",
    "date": "2025-03-22",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "eagles",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 207,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "松井"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "604"
    },
    "companions": "水谷, 高木, 柳川",
    "costInfo": {
      "totalPrice": 4000,
      "myExpense": 1000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 4
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2025-03-23_176",
    "date": "2025-03-23",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "eagles",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 205,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "辛島"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "40",
      "seatNumber": "590"
    },
    "companions": "加藤大",
    "costInfo": {
      "totalPrice": 2000,
      "myExpense": 1000,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2025-03-28_177",
    "date": "2025-03-28",
    "time": "18:30",
    "isDateUnknown": false,
    "homeTeamId": "baystars",
    "awayTeamId": "dragons",
    "stadiumId": "yokohama",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 165,
    "pitchers": {
      "homeStarter": "東",
      "awayStarter": "髙橋宏"
    },
    "homeRuns": [],
    "events": "プロ野球開幕戦",
    "notes": "髙橋宏斗 初の開幕投手",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "V外野応援",
      "row": "9",
      "seatNumber": "538"
    },
    "companions": "後藤",
    "costInfo": {
      "totalPrice": 4200,
      "myExpense": 4725,
      "paymentDestination": "チケットぴあ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "チケットぴあ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.050Z",
    "updatedAt": "2026-11-05T16:55:22.050Z"
  },
  {
    "id": "excel_d1_2025-03-29_178",
    "date": "2025-03-29",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "baystars",
    "awayTeamId": "dragons",
    "stadiumId": "yokohama",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 175,
    "pitchers": {
      "homeStarter": "バウアー",
      "awayStarter": "松葉"
    },
    "homeRuns": [],
    "notes": "松葉貴大 1000投球回達成",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "V外野応援",
      "row": "7",
      "seatNumber": "545"
    },
    "companions": "後藤",
    "costInfo": {
      "totalPrice": 4200,
      "myExpense": 4225,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-04-01_179",
    "date": "2025-04-01",
    "time": "18:15",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 191,
    "pitchers": {
      "homeStarter": "マラー",
      "awayStarter": "井上"
    },
    "homeRuns": [],
    "events": "本拠地開幕戦",
    "notes": "岩嵜翔 移籍後初勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "40",
      "seatNumber": "523"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 6960,
      "myExpense": 3480,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-04-03_181",
    "date": "2025-04-03",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 225,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "田中将"
    },
    "homeRuns": [],
    "events": "オープニングシリーズ2025",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "571"
    },
    "companions": "水谷",
    "costInfo": {
      "totalPrice": 6160,
      "myExpense": 2200,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-04-09_182",
    "date": "2025-04-09",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 165,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "大瀬良"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "32",
      "seatNumber": "564"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 3600,
      "myExpense": 1800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-04-19_183",
    "date": "2025-04-19",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 157,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "ケイ"
    },
    "homeRuns": [
      "中田"
    ],
    "events": "FCスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "35",
      "seatNumber": "526"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 6160,
      "myExpense": 3080,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-04-27_184",
    "date": "2025-04-27",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 201,
    "pitchers": {
      "homeStarter": "メヒア",
      "awayStarter": "小川"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "43",
      "seatNumber": "604"
    },
    "companions": "後藤",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-04-29_185",
    "date": "2025-04-29",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 169,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "才木"
    },
    "homeRuns": [
      "細川"
    ],
    "notes": "涌井秀章 新人から21年連続勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D内野応援",
      "row": "41",
      "seatNumber": "430"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 13200,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-04-30_186",
    "date": "2025-04-30",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 260,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "門別"
    },
    "homeRuns": [
      "木下拓"
    ],
    "notes": "カリステ サヨナラ犠牲フライ",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "34",
      "seatNumber": "570"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-05-05_187",
    "date": "2025-05-05",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 165,
    "pitchers": {
      "homeStarter": "金丸",
      "awayStarter": "ケイ"
    },
    "homeRuns": [
      "木下拓"
    ],
    "events": "ファミリーシリーズ2025",
    "notes": "金丸夢斗 プロ初登板初先発",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "40",
      "seatNumber": "569"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-05-07_188",
    "date": "2025-05-07",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 173,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "大貫"
    },
    "homeRuns": [
      "上林"
    ],
    "events": "昇竜2025",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "35",
      "seatNumber": "524"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 6960,
      "myExpense": 3480,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-05-14_190",
    "date": "2025-05-14",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 156,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "アビラ"
    },
    "homeRuns": [],
    "events": "ワンコインデー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野S",
      "row": "10",
      "seatNumber": "201"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 900,
      "myExpense": 900,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-05-23_191",
    "date": "2025-05-23",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 238,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "村上"
    },
    "homeRuns": [],
    "events": "FCスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "568"
    },
    "companions": "水谷",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-05-25_192",
    "date": "2025-05-25",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 182,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "伊原"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "568"
    },
    "companions": "鈴木",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-05-31_193",
    "date": "2025-05-31",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 211,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "グリフィン"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "31",
      "seatNumber": "583"
    },
    "companions": "後藤",
    "costInfo": {
      "totalPrice": 5860,
      "myExpense": 2930,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-06-06_194",
    "date": "2025-06-06",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "marines",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 179,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "小島"
    },
    "homeRuns": [],
    "events": "ガールズシリーズ2025",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "37",
      "seatNumber": "571"
    },
    "companions": "後藤, 水谷",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-06-18_196",
    "date": "2025-06-18",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "buffaloes",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 6,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 196,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "九里"
    },
    "homeRuns": [
      "ボスラー"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "31",
      "seatNumber": "570"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 3600,
      "myExpense": 1800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-06-21_197",
    "date": "2025-06-21",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "fighters",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 216,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "加藤貴"
    },
    "homeRuns": [
      "細川"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "583"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 5720,
      "myExpense": 2860,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-06-28_198",
    "date": "2025-06-28",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 206,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "玉村"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "36",
      "seatNumber": "605"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 5380,
      "myExpense": 2690,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-06-29_199",
    "date": "2025-06-29",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 159,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "佐藤柳"
    },
    "homeRuns": [],
    "events": "パオロン25周年",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "42",
      "seatNumber": "564"
    },
    "companions": "鈴木",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-07-04_200",
    "date": "2025-07-04",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 164,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "ランバート"
    },
    "homeRuns": [],
    "events": "昇竜2025",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "527"
    },
    "companions": "高木",
    "costInfo": {
      "totalPrice": 6960,
      "myExpense": 3645,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-07-06_202",
    "date": "2025-07-06",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 186,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "アビラ"
    },
    "homeRuns": [],
    "events": "ブルーサマーフェスティバル2025",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "589"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-07-12_203",
    "date": "2025-07-12",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 7,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 157,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "玉村"
    },
    "homeRuns": [],
    "events": "FCスペシャルゲーム",
    "notes": "大野雄大 ３年ぶりの完投勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "43",
      "seatNumber": "585"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-07-20_204",
    "date": "2025-07-20",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 254,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "大貫"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "37",
      "seatNumber": "605"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-07-21_205",
    "date": "2025-07-21",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 175,
    "pitchers": {
      "homeStarter": "金丸",
      "awayStarter": "東"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "39",
      "seatNumber": "604"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_oth_2025-07-23_8",
    "date": "2025-07-23",
    "time": "18:30",
    "isDateUnknown": false,
    "homeTeamId": "tigers",
    "awayTeamId": "tigers",
    "stadiumId": "other_stadium",
    "stadiumCustom": "京セラドーム",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "宮城",
      "awayStarter": "R.マルティネス"
    },
    "homeRuns": [],
    "events": "マイナビオールスターゲーム2025",
    "watchStatus": "watched",
    "cheerTeamId": "tigers",
    "categories": [
      "other"
    ],
    "primaryCategory": "other",
    "seatInfo": {
      "seatTypeName": "外野下段（レフト）",
      "row": "25",
      "seatNumber": "575"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 5510,
      "myExpense": 5510,
      "paymentDestination": "プレイガイド",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "プレイガイド",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.059Z",
    "updatedAt": "2026-11-05T16:55:22.059Z"
  },
  {
    "id": "excel_d1_2025-07-30_206",
    "date": "2025-07-30",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 188,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "戸郷"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "どら楽カウンター",
      "row": "48",
      "seatNumber": "171"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2500,
      "myExpense": 2500,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d2_2025-07-30_6",
    "date": "2025-07-30",
    "time": "10:20",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 8,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 180,
    "pitchers": {
      "homeStarter": "吉田",
      "awayStarter": "茨木"
    },
    "homeRuns": [
      "土田"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "内野自由",
      "row": "16",
      "seatNumber": "181"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2500,
      "myExpense": 2500,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2025-07-31_207",
    "date": "2025-07-31",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 7,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 239,
    "pitchers": {
      "homeStarter": "金丸",
      "awayStarter": "井上"
    },
    "homeRuns": [
      "チェイビス",
      "細川"
    ],
    "notes": "チェイビス　来日初ホームラン",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "42",
      "seatNumber": "553"
    },
    "companions": "加藤大",
    "costInfo": {
      "totalPrice": 2420,
      "myExpense": 2420,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-08-06_213",
    "date": "2025-08-06",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 242,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "村上"
    },
    "homeRuns": [
      "上林"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "584"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-08-07_214",
    "date": "2025-08-07",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 8,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 174,
    "pitchers": {
      "homeStarter": "金丸",
      "awayStarter": "伊原"
    },
    "homeRuns": [
      "チェイビス"
    ],
    "notes": "金丸夢斗 プロ初勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "567"
    },
    "companions": "竹内, 水野",
    "costInfo": {
      "totalPrice": 6000,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d2_2025-08-07_8",
    "date": "2025-08-07",
    "time": "10:20",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "buffaloes",
    "stadiumId": "vantelin_dome",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 174,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "山口"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "バックネット裏自由",
      "row": "12",
      "seatNumber": "67"
    },
    "companions": "水野, 竹内",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2025-08-09_216",
    "date": "2025-08-09",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 182,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "森下"
    },
    "homeRuns": [],
    "events": "竜陣祭2025",
    "notes": "髙橋宏斗 バースデー勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "42",
      "seatNumber": "570"
    },
    "companions": "後藤",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-08-10_217",
    "date": "2025-08-10",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 191,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "玉村"
    },
    "homeRuns": [
      "ボスラー"
    ],
    "events": "昇竜2025",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "35",
      "seatNumber": "523"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 7290,
      "myExpense": 3645,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-08-16_219",
    "date": "2025-08-16",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 161,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "竹田"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "リビングボックス",
      "row": "45",
      "seatNumber": "392"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 20925,
      "myExpense": 0,
      "paymentDestination": "ローチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-08-27_220",
    "date": "2025-08-27",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 148,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "ランバート"
    },
    "homeRuns": [
      "チェイビス"
    ],
    "events": "ドアラデー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "37",
      "seatNumber": "571"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d2_2025-08-27_10",
    "date": "2025-08-27",
    "time": "10:20",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 153,
    "pitchers": {
      "homeStarter": "草加",
      "awayStarter": "西勇"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "内野自由",
      "row": "12",
      "seatNumber": "201"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2025-08-28_221",
    "date": "2025-08-28",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 202,
    "pitchers": {
      "homeStarter": "仲地",
      "awayStarter": "吉村"
    },
    "homeRuns": [],
    "events": "ワンコインデー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "41",
      "seatNumber": "555"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2420,
      "myExpense": 2420,
      "paymentDestination": "イープラス",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "イープラス",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-09-04_222",
    "date": "2025-09-04",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 7,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 231,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "ネルソン"
    },
    "homeRuns": [
      "細川"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "36",
      "seatNumber": "571"
    },
    "companions": "柳川",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-09-07_223",
    "date": "2025-09-07",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 226,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "横川"
    },
    "homeRuns": [
      "細川"
    ],
    "events": "FCスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "36",
      "seatNumber": "524"
    },
    "companions": "高木",
    "costInfo": {
      "totalPrice": 6490,
      "myExpense": 3245,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-09-09_224",
    "date": "2025-09-09",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "swallows",
    "awayTeamId": "dragons",
    "stadiumId": "jingu",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 198,
    "pitchers": {
      "homeStarter": "奥川",
      "awayStarter": "松木平"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "外野指定席B",
      "seatNumber": "1"
    },
    "companions": "竹内, 水野",
    "costInfo": {
      "totalPrice": 7800,
      "myExpense": 2630,
      "paymentDestination": "スワチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "スワチケ",
      "ticketType": "ファミリーマート",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-09-10_226",
    "date": "2025-09-10",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "swallows",
    "awayTeamId": "dragons",
    "stadiumId": "jingu",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 223,
    "pitchers": {
      "homeStarter": "ランバート",
      "awayStarter": "金丸"
    },
    "homeRuns": [
      "岡林"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "外野指定席B",
      "seatNumber": "1"
    },
    "companions": "竹内, 水野",
    "costInfo": {
      "totalPrice": 7800,
      "myExpense": 2630,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-09-12_228",
    "date": "2025-09-12",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "carp",
    "awayTeamId": "dragons",
    "stadiumId": "mazda",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 9,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 190,
    "pitchers": {
      "homeStarter": "森",
      "awayStarter": "柳"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "ビジターP",
      "row": "21",
      "seatNumber": "363"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2320,
      "myExpense": 2320,
      "paymentDestination": "セブンチケット",
      "paymentMethod": "セブンイレブン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "セブンチケット",
      "ticketType": "セブンイレブン",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-09-18_229",
    "date": "2025-09-18",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 7,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 194,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "石田裕"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "583"
    },
    "companions": "水谷",
    "costInfo": {
      "totalPrice": 3600,
      "myExpense": 1800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-09-19_230",
    "date": "2025-09-19",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 184,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "吉村"
    },
    "homeRuns": [],
    "events": "名古屋最終章2025",
    "notes": "中田翔 最終打席は三球三振",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "563"
    },
    "companions": "後藤",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-09-20_232",
    "date": "2025-09-20",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 167,
    "pitchers": {
      "homeStarter": "岡田",
      "awayStarter": "小川"
    },
    "homeRuns": [],
    "events": "名古屋最終章2025",
    "notes": "岡田俊哉 引退登板で村上から三振",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "527"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 6490,
      "myExpense": 3245,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2025-09-21_234",
    "date": "2025-09-21",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 170,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "田中将"
    },
    "homeRuns": [
      "上林",
      "石伊"
    ],
    "events": "本拠地最終戦",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "36",
      "seatNumber": "522"
    },
    "companions": "岡, 竹内",
    "costInfo": {
      "totalPrice": 10935,
      "myExpense": 3645,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d2_2025-09-25_11",
    "date": "2025-09-25",
    "time": "11:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "nagoya_stadium",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 180,
    "pitchers": {
      "homeStarter": "ウォルターズ",
      "awayStarter": "田村"
    },
    "homeRuns": [
      "森駿"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "自由席"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 500,
      "myExpense": 500,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d2_2025-09-27_12",
    "date": "2025-09-27",
    "time": "12:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "hawks",
    "stadiumId": "nagoya_stadium",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 9,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 229,
    "pitchers": {
      "homeStarter": "仲地",
      "awayStarter": "岩崎"
    },
    "homeRuns": [
      "川越"
    ],
    "events": "ファーム竜の感謝祭",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "自由席"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 800,
      "myExpense": 800,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2026-02-19_236",
    "date": "2026-02-19",
    "time": "13:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "fighters",
    "stadiumId": "chatan",
    "stadiumCustom": "Agreスタジアム北谷",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 8,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 182,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "金村"
    },
    "homeRuns": [
      "ボスラー"
    ],
    "events": "練習試合",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野席"
    },
    "companions": "竹内, 岡",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-02-27_238",
    "date": "2026-02-27",
    "time": "19:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "japan_national",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 164,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "宮城"
    },
    "homeRuns": [],
    "events": "侍ジャパンシリーズ2026 名古屋",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "42",
      "seatNumber": "586"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 4860,
      "paymentDestination": "ローチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_jp_2026-02-27_11",
    "date": "2026-02-27",
    "time": "19:00",
    "isDateUnknown": false,
    "homeTeamId": "japan_national",
    "awayTeamId": "dragons",
    "stadiumId": "vantelin_dome",
    "matchType": "international",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "宮城"
    },
    "homeRuns": [
      "佐藤輝・佐々木"
    ],
    "events": "ラグザス侍ジャパンシリーズ2026 名古屋",
    "watchStatus": "watched",
    "cheerTeamId": "japan_national",
    "categories": [
      "japan"
    ],
    "primaryCategory": "japan",
    "seatInfo": {
      "seatTypeName": "外野応援（ライト）",
      "row": "42",
      "seatNumber": "586"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 4860,
      "myExpense": 4860,
      "paymentDestination": "ローソンチケット",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2026-02-28_239",
    "date": "2026-02-28",
    "time": "19:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "japan_national",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 7,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 176,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "伊藤大"
    },
    "homeRuns": [
      "辻本",
      "細川"
    ],
    "events": "侍ジャパンシリーズ2026 名古屋",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "42",
      "seatNumber": "603"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 4585,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_jp_2026-02-28_12",
    "date": "2026-02-28",
    "time": "19:00",
    "isDateUnknown": false,
    "homeTeamId": "japan_national",
    "awayTeamId": "dragons",
    "stadiumId": "vantelin_dome",
    "matchType": "international",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 7,
    "isScoreConfirmed": true,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "伊藤大"
    },
    "homeRuns": [
      "牧・森下"
    ],
    "events": "ラグザス侍ジャパンシリーズ2026 名古屋",
    "watchStatus": "watched",
    "cheerTeamId": "japan_national",
    "categories": [
      "japan"
    ],
    "primaryCategory": "japan",
    "seatInfo": {
      "seatTypeName": "外野応援（ライト）",
      "row": "42",
      "seatNumber": "603"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 4585,
      "myExpense": 4585,
      "paymentDestination": "ローソンチケット",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2026-03-01_241",
    "date": "2026-03-01",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 9,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 187,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "東"
    },
    "homeRuns": [
      "細川"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "41",
      "seatNumber": "605"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 2600,
      "myExpense": 1300,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-03-10_242",
    "date": "2026-03-10",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 7,
    "awayScore": 12,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 201,
    "pitchers": {
      "homeStarter": "三浦",
      "awayStarter": "松本健"
    },
    "homeRuns": [
      "サノー"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "31",
      "seatNumber": "568"
    },
    "companions": "水谷",
    "costInfo": {
      "totalPrice": 2600,
      "myExpense": 1300,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-03-15_243",
    "date": "2026-03-15",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "eagles",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 148,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "古謝"
    },
    "homeRuns": [
      "サノー"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "565"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2600,
      "myExpense": 1300,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-03-20_244",
    "date": "2026-03-20",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "marines",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 183,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "毛利"
    },
    "homeRuns": [
      "カリステ"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "フィールドシート",
      "row": "3",
      "seatNumber": "17"
    },
    "companions": "加藤大",
    "costInfo": {
      "totalPrice": 2600,
      "myExpense": 6285,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-03-21_245",
    "date": "2026-03-21",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "marines",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 167,
    "pitchers": {
      "homeStarter": "櫻井",
      "awayStarter": "田中晴"
    },
    "homeRuns": [
      "サノー"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野A",
      "row": "35",
      "seatNumber": "324"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 8800,
      "myExpense": 0,
      "paymentDestination": "ローチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ファミリーマート",
      "quantity": 4
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-03-22_246",
    "date": "2026-03-22",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "marines",
    "stadiumId": "vantelin_dome",
    "matchType": "open",
    "matchStatus": "finished",
    "homeScore": 6,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 166,
    "pitchers": {
      "homeStarter": "マラー",
      "awayStarter": "小島"
    },
    "homeRuns": [
      "辻本"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "39",
      "seatNumber": "605"
    },
    "companions": "竹内, 鈴木",
    "costInfo": {
      "totalPrice": 2600,
      "myExpense": 1300,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d2_2026-03-24_13",
    "date": "2026-03-24",
    "time": "12:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "nagoya_stadium",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 161,
    "pitchers": {
      "homeStarter": "金丸",
      "awayStarter": "デュプランティエ"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "自由席"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 500,
      "myExpense": 500,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2026-03-27_248",
    "date": "2026-03-27",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "carp",
    "awayTeamId": "dragons",
    "stadiumId": "mazda",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 6,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 254,
    "pitchers": {
      "homeStarter": "床田",
      "awayStarter": "柳"
    },
    "homeRuns": [],
    "events": "プロ野球開幕戦",
    "notes": "柳裕也 2度目の開幕投手",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "ビジターP",
      "row": "9",
      "seatNumber": "375"
    },
    "companions": "後藤",
    "costInfo": {
      "totalPrice": 6620,
      "myExpense": 3145,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-03-28_249",
    "date": "2026-03-28",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "carp",
    "awayTeamId": "dragons",
    "stadiumId": "mazda",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 177,
    "pitchers": {
      "homeStarter": "ターノック",
      "awayStarter": "櫻井"
    },
    "homeRuns": [],
    "notes": "櫻井頼之介 プロ初登板初先発",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "ビジターP",
      "row": "12",
      "seatNumber": "385"
    },
    "companions": "後藤",
    "costInfo": {
      "totalPrice": 6290,
      "myExpense": 3145,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-03-31_250",
    "date": "2026-03-31",
    "time": "18:15",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 184,
    "pitchers": {
      "homeStarter": "金丸",
      "awayStarter": "ウィットリー"
    },
    "homeRuns": [
      "サノー"
    ],
    "events": "本拠地開幕戦",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "29",
      "seatNumber": "465"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 7290,
      "myExpense": 3645,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-04-01_252",
    "date": "2026-04-01",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 202,
    "pitchers": {
      "homeStarter": "中西",
      "awayStarter": "田中将"
    },
    "homeRuns": [
      "福永"
    ],
    "events": "オープニングシリーズ2026",
    "notes": "中西聖輝 プロ初登板初先発",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "30",
      "seatNumber": "568"
    },
    "companions": "高木",
    "costInfo": {
      "totalPrice": 14900,
      "myExpense": 2750,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-04-10_253",
    "date": "2026-04-10",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 188,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "村上"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "44",
      "seatNumber": "545"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-04-12_254",
    "date": "2026-04-12",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 164,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "髙橋"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "42",
      "seatNumber": "566"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-04-15_255",
    "date": "2026-04-15",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 187,
    "pitchers": {
      "homeStarter": "マラー",
      "awayStarter": "栗林"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "569"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 1800,
      "myExpense": 1800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-04-24_256",
    "date": "2026-04-24",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 6,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 172,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "松本健"
    },
    "homeRuns": [
      "ボスラー",
      "村松"
    ],
    "notes": "村松開人 逆転サヨナラ3ランホームラン",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "44",
      "seatNumber": "541"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 1800,
      "myExpense": 1800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-04-25_258",
    "date": "2026-04-25",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 155,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "小川"
    },
    "homeRuns": [
      "板山",
      "石伊"
    ],
    "notes": "板山祐太郎 満塁ホームラン",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "44",
      "seatNumber": "541"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 14900,
      "myExpense": 3300,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-04-26_260",
    "date": "2026-04-26",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 187,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "奥川"
    },
    "homeRuns": [],
    "events": "FCスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "45",
      "seatNumber": "487"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 7290,
      "myExpense": 3245,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-04-30_261",
    "date": "2026-04-30",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 157,
    "pitchers": {
      "homeStarter": "マラー",
      "awayStarter": "篠木"
    },
    "homeRuns": [
      "細川"
    ],
    "events": "昇竜2026",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "44",
      "seatNumber": "541"
    },
    "companions": "水谷",
    "costInfo": {
      "totalPrice": 6490,
      "myExpense": 3645,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-05-04_262",
    "date": "2026-05-04",
    "time": "14:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 7,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 183,
    "pitchers": {
      "homeStarter": "中西",
      "awayStarter": "門別"
    },
    "homeRuns": [
      "細川",
      "石伊"
    ],
    "events": "ファミリーシリーズ2026",
    "notes": "中西聖輝 プロ初勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "43",
      "seatNumber": "586"
    },
    "companions": "後藤",
    "costInfo": {
      "totalPrice": 5280,
      "myExpense": 2640,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-05-06_264",
    "date": "2026-05-06",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 149,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "髙橋"
    },
    "homeRuns": [],
    "events": "ファミリーシリーズ2026",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "606"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2640,
      "myExpense": 2640,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-05-08_265",
    "date": "2026-05-08",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 9,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 182,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "ウィットリー"
    },
    "homeRuns": [
      "ボスラー",
      "細川"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "43",
      "seatNumber": "555"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-05-10_267",
    "date": "2026-05-10",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 9,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 208,
    "pitchers": {
      "homeStarter": "櫻井",
      "awayStarter": "森田"
    },
    "homeRuns": [
      "カリステ",
      "鵜飼"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "41",
      "seatNumber": "549"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-05-16_269",
    "date": "2026-05-16",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 8,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 166,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "奥川"
    },
    "homeRuns": [
      "村松",
      "石川昂"
    ],
    "events": "DRAGONS LEGENDS DAY～Blue Together！～",
    "notes": "村松開人 サイクル王手の3安打5打点",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "41",
      "seatNumber": "551"
    },
    "companions": "伊藤翼",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-05-17_271",
    "date": "2026-05-17",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 172,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "松本健"
    },
    "homeRuns": [
      "村松"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "40",
      "seatNumber": "592"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-05-22_272",
    "date": "2026-05-22",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 6,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 190,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "栗林"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野S",
      "row": "28",
      "seatNumber": "231"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-05-23_273",
    "date": "2026-05-23",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 189,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "森下"
    },
    "homeRuns": [
      "鵜飼"
    ],
    "events": "FCスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "44",
      "seatNumber": "610"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 3070,
      "myExpense": 3465,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-05-24_274",
    "date": "2026-05-24",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 204,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "岡本"
    },
    "homeRuns": [],
    "events": "チアドラデー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "44",
      "seatNumber": "541"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 14900,
      "myExpense": 14900,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-05-26_275",
    "date": "2026-05-26",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "eagles",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 144,
    "pitchers": {
      "homeStarter": "マラー",
      "awayStarter": "荘司"
    },
    "homeRuns": [
      "細川"
    ],
    "events": "昇竜2026",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "44",
      "seatNumber": "545"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 7290,
      "myExpense": 3645,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-05-28_276",
    "date": "2026-05-28",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "eagles",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 173,
    "pitchers": {
      "homeStarter": "金丸",
      "awayStarter": "瀧中"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "583"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 1800,
      "myExpense": 1800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-05-30_277",
    "date": "2026-05-30",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "buffaloes",
    "awayTeamId": "dragons",
    "stadiumId": "other_stadium",
    "stadiumCustom": "京セラドーム",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 144,
    "pitchers": {
      "homeStarter": "田嶋",
      "awayStarter": "大野雄"
    },
    "homeRuns": [
      "石川昂"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "ビジター下段",
      "row": "24",
      "seatNumber": "562"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 5200,
      "myExpense": 3645,
      "paymentDestination": "オリチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "オリチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-06-03_278",
    "date": "2026-06-03",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "hawks",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 8,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 279,
    "pitchers": {
      "homeStarter": "櫻井",
      "awayStarter": "松本晴"
    },
    "homeRuns": [
      "細川"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "34",
      "seatNumber": "570"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-06-04_279",
    "date": "2026-06-04",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "hawks",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 177,
    "pitchers": {
      "homeStarter": "金丸",
      "awayStarter": "スチュワードJr."
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野S",
      "row": "19",
      "seatNumber": "105"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 14900,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-06-05_280",
    "date": "2026-06-05",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "lions",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 174,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "髙橋光成"
    },
    "homeRuns": [],
    "events": "ガールズシリーズ2026",
    "notes": "阿部寿樹 サヨナラタイムリー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "568"
    },
    "companions": "高木",
    "costInfo": {
      "totalPrice": 3600,
      "myExpense": 1800,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-06-06_281",
    "date": "2026-06-06",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "lions",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 153,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "隅田"
    },
    "homeRuns": [
      "板山"
    ],
    "events": "ガールズシリーズ2026",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "内野A",
      "row": "29",
      "seatNumber": "311"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 11540,
      "myExpense": 0,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "ファミリーマート",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-06-07_282",
    "date": "2026-06-07",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "lions",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 240,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "ワイナンス"
    },
    "homeRuns": [],
    "events": "ガールズシリーズ2026",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "681"
    },
    "companions": "鈴木, 竹内",
    "costInfo": {
      "totalPrice": 2600,
      "myExpense": 2600,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-06-24_284",
    "date": "2026-06-24",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 196,
    "pitchers": {
      "homeStarter": "櫻井",
      "awayStarter": "東"
    },
    "homeRuns": [
      "サノー",
      "サノー"
    ],
    "events": "FCスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "38",
      "seatNumber": "570"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-07-05_286",
    "date": "2026-07-05",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 173,
    "pitchers": {
      "homeStarter": "金丸",
      "awayStarter": "井上"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "40",
      "seatNumber": "606"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 6420,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-07-10_287",
    "date": "2026-07-10",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 10,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 164,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "森下"
    },
    "homeRuns": [
      "細川",
      "サノー"
    ],
    "events": "ブルーサマーフェスティバル2026",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "31",
      "seatNumber": "571"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-07-16_289",
    "date": "2026-07-16",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 182,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "伊原"
    },
    "homeRuns": [],
    "events": "FCスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "41",
      "seatNumber": "590"
    },
    "companions": "水谷",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-07-24_290",
    "date": "2026-07-24",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 216,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "東"
    },
    "homeRuns": [
      "細川"
    ],
    "events": "ドアラデー",
    "notes": "吉田聖弥 プロ初勝利",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "569"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-08-06_292",
    "date": "2026-08-06",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 204,
    "pitchers": {
      "homeStarter": "金丸",
      "awayStarter": "増居"
    },
    "homeRuns": [],
    "events": "ワンコインデー",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "569"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-08-11_293",
    "date": "2026-08-11",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 189,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "尾形"
    },
    "homeRuns": [],
    "events": "スーパーマリオブラザーズ40周年 × プロ野球12球団",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "42",
      "seatNumber": "546"
    },
    "companions": "岡, 竹内",
    "costInfo": {
      "totalPrice": 6600,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-08-13_295",
    "date": "2026-08-13",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "baystars",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 158,
    "pitchers": {
      "homeStarter": "金丸",
      "awayStarter": "深沢"
    },
    "homeRuns": [
      "上林"
    ],
    "events": "FCスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "43",
      "seatNumber": "508"
    },
    "companions": "吉政",
    "costInfo": {
      "totalPrice": 6460,
      "myExpense": 3230,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-08-14_296",
    "date": "2026-08-14",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 166,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "ハワード"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "42",
      "seatNumber": "571"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 3050,
      "myExpense": 3050,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-08-16_297",
    "date": "2026-08-16",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 11,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 205,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "小笠原"
    },
    "homeRuns": [],
    "events": "DRAGONS LEGENDS DAY～Blue Together！～",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "45",
      "seatNumber": "548"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 5200,
      "myExpense": 2600,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-08-21_298",
    "date": "2026-08-21",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 179,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "奥川"
    },
    "homeRuns": [
      "細川"
    ],
    "events": "竜陣祭2026",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "45",
      "seatNumber": "547"
    },
    "companions": "伊藤翼, 竹内",
    "costInfo": {
      "totalPrice": 6600,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-08-22_300",
    "date": "2026-08-22",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 197,
    "pitchers": {
      "homeStarter": "マラー",
      "awayStarter": "増居"
    },
    "homeRuns": [
      "福永",
      "花田",
      "細川"
    ],
    "events": "竜陣祭2026",
    "notes": "細川成也 サヨナラ押し出し四球",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "42",
      "seatNumber": "546"
    },
    "companions": "後藤",
    "costInfo": {
      "totalPrice": 14900,
      "myExpense": 2950,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-08-23_303",
    "date": "2026-08-23",
    "time": "13:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 194,
    "pitchers": {
      "homeStarter": "柳",
      "awayStarter": "松本健"
    },
    "homeRuns": [
      "サノー"
    ],
    "events": "竜陣祭2026",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "41",
      "seatNumber": "466"
    },
    "companions": "高木",
    "costInfo": {
      "totalPrice": 6490,
      "myExpense": 3245,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d2_2026-08-25_14",
    "date": "2026-08-25",
    "time": "10:20",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 8,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 146,
    "pitchers": {
      "homeStarter": "中西",
      "awayStarter": "花田"
    },
    "homeRuns": [
      "大島"
    ],
    "notes": "高橋周平 満塁ホームラン",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "内野自由",
      "row": "18",
      "seatNumber": "201"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 1000,
      "myExpense": 1000,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2026-08-26_304",
    "date": "2026-08-26",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 175,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "伊藤将"
    },
    "homeRuns": [
      "福永",
      "サノー"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "33",
      "seatNumber": "568"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 4400,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d2_2026-08-26_16",
    "date": "2026-08-26",
    "time": "10:20",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 144,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "戸郷"
    },
    "homeRuns": [
      "石橋"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "バックネット裏自由",
      "row": "16",
      "seatNumber": "68"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2026-08-27_306",
    "date": "2026-08-27",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 3,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 217,
    "pitchers": {
      "homeStarter": "金丸",
      "awayStarter": "下村"
    },
    "homeRuns": [
      "福永"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "34",
      "seatNumber": "569"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 4000,
      "myExpense": 2200,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d2_2026-08-27_17",
    "date": "2026-08-27",
    "time": "10:20",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 4,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 160,
    "pitchers": {
      "homeStarter": "仲地",
      "awayStarter": "園田"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "内野自由",
      "row": "17",
      "seatNumber": "181"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2200,
      "myExpense": 2200,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d2_2026-08-30_18",
    "date": "2026-08-30",
    "time": "11:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "nagoya_stadium",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 12,
    "awayScore": 2,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 180,
    "pitchers": {
      "homeStarter": "土生",
      "awayStarter": "宮路"
    },
    "homeRuns": [
      "森駿"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "自由席"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 800,
      "myExpense": 800,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d2_2026-08-30_19",
    "date": "2026-08-30",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "tigers",
    "stadiumId": "nagoya_stadium",
    "matchType": "practice",
    "matchStatus": "scheduled",
    "homeScore": null,
    "awayScore": null,
    "isScoreConfirmed": false,
    "matchDurationMinutes": null,
    "pitchers": {
      "homeStarter": "土生",
      "awayStarter": "宮路"
    },
    "homeRuns": [
      "石川大"
    ],
    "watchStatus": "scheduled",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "自由席"
    },
    "costInfo": {
      "totalPrice": 800,
      "myExpense": 800,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2026-09-01_307",
    "date": "2026-09-01",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 181,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "床田"
    },
    "homeRuns": [
      "田中"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "44",
      "seatNumber": "541"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 5500,
      "myExpense": 2500,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d2_2026-09-01_20",
    "date": "2026-09-01",
    "time": "11:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "hawks",
    "stadiumId": "nagoya_stadium",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 0,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 167,
    "pitchers": {
      "homeStarter": "中西",
      "awayStarter": "大山"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "自由席"
    },
    "companions": "家族",
    "costInfo": {
      "totalPrice": 2500,
      "myExpense": 2500,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2026-09-02_308",
    "date": "2026-09-02",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 4,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 191,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "鈴木健"
    },
    "homeRuns": [
      "ボスラー",
      "福永"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "どら楽カウンター",
      "row": "48",
      "seatNumber": "190"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 2500,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d2_2026-09-02_21",
    "date": "2026-09-02",
    "time": "11:30",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "hawks",
    "stadiumId": "nagoya_stadium",
    "matchType": "practice",
    "matchStatus": "finished",
    "homeScore": 6,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 164,
    "pitchers": {
      "homeStarter": "松葉",
      "awayStarter": "大関"
    },
    "homeRuns": [
      "石橋"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "自由席"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 2500,
      "myExpense": 2500,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2026-09-03_310",
    "date": "2026-09-03",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 205,
    "pitchers": {
      "homeStarter": "金丸",
      "awayStarter": "栗林"
    },
    "homeRuns": [
      "石川昂"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "28",
      "seatNumber": "563"
    },
    "companions": "水谷",
    "costInfo": {
      "totalPrice": 5500,
      "myExpense": 2750,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ファミリーマート",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-09-12_311",
    "date": "2026-09-12",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "swallows",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 6,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 225,
    "pitchers": {
      "homeStarter": "涌井",
      "awayStarter": "高梨"
    },
    "homeRuns": [],
    "events": "FCスペシャルゲーム",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "44",
      "seatNumber": "549"
    },
    "companions": "水野",
    "costInfo": {
      "totalPrice": 8690,
      "myExpense": 4345,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d2_2026-09-16_22",
    "date": "2026-09-16",
    "time": "13:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "lions",
    "stadiumId": "nagoya_stadium",
    "matchType": "practice",
    "matchStatus": "scheduled",
    "homeScore": null,
    "awayScore": null,
    "isScoreConfirmed": false,
    "matchDurationMinutes": null,
    "pitchers": {},
    "homeRuns": [],
    "watchStatus": "scheduled",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_2nd"
    ],
    "primaryCategory": "dragons_2nd",
    "seatInfo": {
      "seatTypeName": "自由席"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 0,
      "paymentDestination": "球場窓口",
      "paymentMethod": "現金",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "球場窓口",
      "ticketType": "紙チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.058Z",
    "updatedAt": "2026-11-05T16:55:22.058Z"
  },
  {
    "id": "excel_d1_2026-09-18_312",
    "date": "2026-09-18",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "giants",
    "awayTeamId": "dragons",
    "stadiumId": "tokyo_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 2,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 148,
    "pitchers": {
      "homeStarter": "井上",
      "awayStarter": "金丸"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "V応援席",
      "row": "6",
      "seatNumber": "521"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 6090,
      "myExpense": 3150,
      "paymentDestination": "ローチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-09-19_313",
    "date": "2026-09-19",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "giants",
    "awayTeamId": "dragons",
    "stadiumId": "tokyo_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 14,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 192,
    "pitchers": {
      "homeStarter": "田中将",
      "awayStarter": "中西"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "V応援席",
      "row": "4",
      "seatNumber": "502"
    },
    "companions": "岡, 竹内",
    "costInfo": {
      "totalPrice": 9765,
      "myExpense": 3255,
      "paymentDestination": "Gオフィシャル",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "Gオフィシャル",
      "ticketType": "ファミリーマート",
      "quantity": 3
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-09-20_315",
    "date": "2026-09-20",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 8,
    "awayScore": 5,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 172,
    "pitchers": {
      "homeStarter": "大野雄",
      "awayStarter": "森"
    },
    "homeRuns": [
      "石川昂",
      "細川",
      "花田",
      "細川"
    ],
    "events": "ファイナルシリーズ2026",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "44",
      "seatNumber": "545"
    },
    "companions": "桐山",
    "costInfo": {
      "totalPrice": 8690,
      "myExpense": 4345,
      "paymentDestination": "ドラチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ドラチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-09-21_319",
    "date": "2026-09-21",
    "time": "14:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "carp",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 10,
    "awayScore": 0,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 192,
    "pitchers": {
      "homeStarter": "髙橋宏",
      "awayStarter": "斉藤優"
    },
    "homeRuns": [
      "村松"
    ],
    "events": "本拠地最終戦",
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "D外野応援",
      "row": "30",
      "seatNumber": "467"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 7290,
      "myExpense": 3645,
      "paymentDestination": "ローチケ",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 2
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-10-01_321",
    "date": "2026-10-01",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "carp",
    "awayTeamId": "dragons",
    "stadiumId": "mazda",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 5,
    "awayScore": 1,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 132,
    "pitchers": {
      "homeStarter": "床田",
      "awayStarter": "大野雄"
    },
    "homeRuns": [
      "細川"
    ],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "ビジターP",
      "row": "12",
      "seatNumber": "353"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 0,
      "myExpense": 2320,
      "paymentDestination": "イープラス",
      "paymentMethod": "カード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "イープラス",
      "ticketType": "ファミリーマート",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_d1_2026-10-03_322",
    "date": "2026-10-03",
    "time": "18:00",
    "isDateUnknown": false,
    "homeTeamId": "swallows",
    "awayTeamId": "dragons",
    "stadiumId": "jingu",
    "matchType": "official",
    "matchStatus": "finished",
    "homeScore": 1,
    "awayScore": 3,
    "isScoreConfirmed": true,
    "matchDurationMinutes": 174,
    "pitchers": {
      "homeStarter": "高梨",
      "awayStarter": "髙橋宏"
    },
    "homeRuns": [],
    "watchStatus": "watched",
    "cheerTeamId": "dragons",
    "categories": [
      "dragons_1st"
    ],
    "primaryCategory": "dragons_1st",
    "seatInfo": {
      "seatTypeName": "外野指定席B",
      "seatNumber": "6"
    },
    "companions": "ー",
    "costInfo": {
      "totalPrice": 5595,
      "myExpense": 5595,
      "paymentDestination": "ローチケ",
      "paymentMethod": "ローソン",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "ローチケ",
      "ticketType": "ローソン",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.051Z",
    "updatedAt": "2026-11-05T16:55:22.051Z"
  },
  {
    "id": "excel_oth_2026-11-22_9",
    "date": "2026-11-22",
    "time": "13:00",
    "isDateUnknown": false,
    "homeTeamId": "dragons",
    "awayTeamId": "giants",
    "stadiumId": "vantelin_dome",
    "matchType": "official",
    "matchStatus": "scheduled",
    "homeScore": null,
    "awayScore": null,
    "isScoreConfirmed": false,
    "matchDurationMinutes": null,
    "pitchers": {},
    "homeRuns": [],
    "events": "LEGENDS MATCH 2026",
    "watchStatus": "scheduled",
    "cheerTeamId": "dragons",
    "categories": [
      "other"
    ],
    "primaryCategory": "other",
    "seatInfo": {
      "seatTypeName": "内野B",
      "row": "7",
      "seatNumber": "361"
    },
    "companions": "竹内",
    "costInfo": {
      "totalPrice": 3495,
      "myExpense": 3495,
      "paymentDestination": "プレイガイド",
      "paymentMethod": "クレジットカード",
      "splits": [],
      "refundStatus": "none"
    },
    "ticketInfo": {
      "status": "ticketed",
      "vendor": "プレイガイド",
      "ticketType": "電子チケット",
      "quantity": 1
    },
    "createdAt": "2026-11-05T16:55:22.059Z",
    "updatedAt": "2026-11-05T16:55:22.059Z"
  }
];
