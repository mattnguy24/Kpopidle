from flask import Flask, render_template, send_from_directory, redirect, url_for
import os
import datetime
from zoneinfo import ZoneInfo
application = Flask(__name__)
PST = ZoneInfo("America/Los_Angeles")

@application.route('/')
def home():
    today_date = datetime.datetime.now(PST).date().strftime("%Y-%m-%d")
    return render_template('index.html', date=today_date, today_date=today_date)

@application.route('/history/<date>')
def history(date):
    try:
        datetime.datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return "Invalid date format. Use YYYY-MM-DD.", 400
    today_date = datetime.datetime.now(PST).date().strftime("%Y-%m-%d")
    if date == today_date:
        return redirect(url_for('home'))
    return render_template('index.html', date=date, today_date=today_date)

@application.route('/robots.txt')
def robots_txt():
    return send_from_directory(application.static_folder, 'robots.txt')

@application.route('/ads.txt')
def ads_txt():
    return send_from_directory(application.static_folder, 'ads.txt')

@application.route('/sitemap.xml')
def site_map():
    return send_from_directory(application.static_folder, 'sitemap.xml')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 80))
    application.run(host='0.0.0.0', port=port, debug=False)