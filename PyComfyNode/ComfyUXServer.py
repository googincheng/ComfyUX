from server import PromptServer
from aiohttp import web
import asyncio
import json
import os

class ComfyUXServer:
    def __init__(self):
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        self.recent_files_path = os.path.join(self.base_dir, 'WebExtension', 'userdata', 'recent.json')

        # 动态添加 GET 和 POST 路由
        # 需要改为comfyux开头，避免冲突
        self.add_route('GET', '/get_recent_files', self.get_recent_files)
        self.add_route('GET', '/open_file', self.open_file)
        self.add_route('POST', '/store_recent_files', self.store_recent_files)
        print('😊ComfyUXServer setup')

    def add_route(self, method, path, handler):
        if method == 'GET':
            PromptServer.instance.app.router.add_get(path, handler)
        elif method == 'POST':
            PromptServer.instance.app.router.add_post(path, handler)

    async def get_recent_files(self, request):
        try:
            with open(self.recent_files_path, 'r') as f:
                data = json.load(f)
            return web.json_response(data)
        except FileNotFoundError:
            return web.json_response([], status=404)

    async def open_file(self, request):
        try:
            workflow_name = request.rel_url.query.get('workflow_name')
            if not workflow_name:
                return web.json_response({'error': 'workflow_name is required'}, status=400)

            with open(workflow_name, 'r') as f:
                data = json.load(f)
            return web.json_response(data)
        except FileNotFoundError:
            return web.json_response({'error': 'File not found'}, status=404)

    async def store_recent_files(self, request):
        try:
            data = await request.json()
            with open(self.recent_files_path, 'w') as f:
                json.dump(data, f, indent=4)
            return web.json_response({'status': 'success'})
        except json.JSONDecodeError:
            return web.json_response({'status': 'error', 'message': 'Invalid JSON data'}, status=400)



