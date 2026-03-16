<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Http\Resources\GroupResource;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class GroupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Group::query()
            ->where('owner_id', $request->user()->id)
            ->orderByDesc('created_at');

        $groups = $query->paginate(
            perPage: (int) $request->integer('per_page', 15),
            page: (int) $request->integer('page', 1)
        );

        return response()->json(GroupResource::collection($groups));
    }

    public function store(StoreGroupRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['owner_id'] = $request->user()->id;

        $group = Group::create($data);

        return (new GroupResource($group))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Group $group, Request $request): JsonResponse
    {
        $this->authorizeOwner($request, $group);

        return response()->json(new GroupResource($group));
    }

    public function update(UpdateGroupRequest $request, Group $group): JsonResponse
    {
        $this->authorizeOwner($request, $group);

        $group->update($request->validated());

        return response()->json(new GroupResource($group));
    }

    public function destroy(Request $request, Group $group): Response
    {
        $this->authorizeOwner($request, $group);

        $group->delete();

        return response()->noContent();
    }

    private function authorizeOwner(Request $request, Group $group): void
    {
        abort_unless(
            $group->owner_id === $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'You are not allowed to access this group.'
        );
    }
}

